import { z } from "zod";
import { calculateChizpaScore, classifyProject } from "../../lib/classify";
import { getRuntimeEnv } from "../../lib/runtime-env";
import { services } from "../../data/services";

const briefSchema = z.object({
  idea: z.string().trim().min(12).max(4000),
  outcome: z.string().trim().min(2).max(160),
  audience: z.string().trim().min(2).max(500),
  tone: z.array(z.string().trim().min(1).max(50)).min(1).max(6),
  format: z.string().trim().min(2).max(100),
  materials: z.string().trim().max(4000).default(""),
  deadline: z.string().trim().min(2).max(100),
  email: z.email().max(320),
});

const requestSchema = z.object({
  serviceId: z.string().trim().min(2).max(100),
  brief: briefSchema,
  chizpaScore: z.number().optional(),
});

type RuntimeSecrets = {
  STRIPE_SECRET_KEY?: string;
  APP_BASE_URL?: string;
  BUCKET?: {
    put: (key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }) => Promise<unknown>;
    delete: (keys: string | string[]) => Promise<void>;
  };
};

const MAX_FILES = 5;
const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_TOTAL_BYTES = 40 * 1024 * 1024;
const allowedExtensions = new Set(["ppt", "pptx", "doc", "docx", "xls", "xlsx", "pdf", "png", "jpg", "jpeg", "webp", "mp3", "wav", "mp4", "mov", "zip"]);

function fileExtension(name: string) {
  return name.split(".").pop()?.toLocaleLowerCase("es") ?? "";
}

function safeFileName(name: string) {
  const cleaned = name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned.slice(-120) || "material";
}

export async function POST(request: Request) {
  let rawPayload: unknown = null;
  let files: File[] = [];
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData().catch(() => null);
    if (formData) {
      try { rawPayload = JSON.parse(String(formData.get("payload") ?? "")); } catch { rawPayload = null; }
      files = formData.getAll("files").filter((value): value is File => value instanceof File && value.size > 0);
    }
  } else {
    rawPayload = await request.json().catch(() => null);
  }

  const parsed = requestSchema.safeParse(rawPayload);
  if (!parsed.success) return Response.json({ error: "El brief está incompleto.", details: parsed.error.flatten() }, { status: 400 });

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const invalidFile = files.find((file) => !allowedExtensions.has(fileExtension(file.name)) || file.size > MAX_FILE_BYTES);
  if (files.length > MAX_FILES || totalBytes > MAX_TOTAL_BYTES || invalidFile) {
    return Response.json({ error: invalidFile ? `${invalidFile.name} no cumple el formato o tamaño permitido.` : "Los materiales superan los límites de carga." }, { status: 413 });
  }

  const { serviceId, brief } = parsed.data;
  const service = services.find((item) => item.id === serviceId);
  if (!service) return Response.json({ error: "La Chizpa seleccionada no existe." }, { status: 404 });

  const classification = classifyProject(brief.idea, serviceId);
  if (classification.decision !== "eligible") {
    return Response.json({ error: classification.explanation, code: `scope_${classification.decision}` }, { status: 422 });
  }

  const runtimeEnv = await getRuntimeEnv<RuntimeSecrets>();
  if (!runtimeEnv.STRIPE_SECRET_KEY) {
    return Response.json({
      error: "Stripe todavía no está configurado en este entorno.",
      code: "stripe_not_configured",
    }, { status: 503 });
  }
  if (!runtimeEnv.DB) {
    return Response.json({ error: "La base de pedidos no está disponible.", code: "database_not_configured" }, { status: 503 });
  }
  if (files.length && !runtimeEnv.BUCKET) {
    return Response.json({ error: "La carga de materiales todavía no está disponible.", code: "storage_not_configured" }, { status: 503 });
  }

  const orderId = crypto.randomUUID();
  const humanCode = `CHZ-${orderId.slice(0, 6).toUpperCase()}`;
  const amountCents = service.price * 100;
  const score = calculateChizpaScore(brief);
  const scopeSnapshot = {
    version: 1,
    serviceId: service.id,
    title: service.title,
    result: service.result,
    includes: service.includes,
    needs: service.needs,
    revisions: service.revisions,
    promisedHours: service.hours,
    recurrence: service.recurrence ?? null,
    amountCents,
    currency: "usd",
  };

  const attachmentSummary = files.map((file) => ({ name: file.name, size: file.size, type: file.type || "application/octet-stream" }));
  await runtimeEnv.DB.batch([
    runtimeEnv.DB.prepare(`INSERT INTO orders (
      id, human_code, service_id, project_idea, customer_email, brief_json,
      scope_snapshot_json, chizpa_score, amount_cents, currency,
      payment_status, brief_status, work_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'usd', 'unpaid', 'submitted', 'blocked')`).bind(
      orderId, humanCode, service.id, brief.idea, brief.email,
      JSON.stringify({ ...brief, attachments: attachmentSummary }), JSON.stringify(scopeSnapshot), score, amountCents,
    ),
    runtimeEnv.DB.prepare("INSERT INTO order_events (id, order_id, type, message) VALUES (?, ?, 'brief_submitted', ?)").bind(
      crypto.randomUUID(), orderId, "Chispita convirtió el pedido en un brief estructurado.",
    ),
  ]);

  if (files.length && runtimeEnv.BUCKET) {
    const uploadedKeys: string[] = [];
    const fileRows: Array<{ id: string; key: string; file: File }> = [];
    try {
      for (const file of files) {
        const fileId = crypto.randomUUID();
        const key = `orders/${orderId}/source/${fileId}-${safeFileName(file.name)}`;
        await runtimeEnv.BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type || "application/octet-stream" },
          customMetadata: { orderId, originalName: file.name.slice(0, 240) },
        });
        uploadedKeys.push(key);
        fileRows.push({ id: fileId, key, file });
      }
      await runtimeEnv.DB.batch(fileRows.map(({ id, key, file }) => runtimeEnv.DB!.prepare(`INSERT INTO order_files (
        id, order_id, object_key, original_name, content_type, size_bytes, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'received')`).bind(id, orderId, key, file.name, file.type || "application/octet-stream", file.size)));
      await runtimeEnv.DB.prepare("INSERT INTO order_events (id, order_id, type, message) VALUES (?, ?, 'materials_received', ?)")
        .bind(crypto.randomUUID(), orderId, `${files.length} ${files.length === 1 ? "material recibido" : "materiales recibidos"} con el brief.`).run();
    } catch {
      if (uploadedKeys.length) await runtimeEnv.BUCKET.delete(uploadedKeys).catch(() => undefined);
      await runtimeEnv.DB.prepare("UPDATE orders SET brief_status = 'upload_failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(orderId).run();
      return Response.json({ error: "No pudimos guardar tus materiales. Tu pago no fue iniciado; prueba nuevamente." }, { status: 500 });
    }
  }

  const requestOrigin = new URL(request.url).origin;
  const baseUrl = runtimeEnv.APP_BASE_URL?.replace(/\/$/, "") || requestOrigin;
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${baseUrl}/start?service=${encodeURIComponent(service.id)}`);
  form.set("client_reference_id", orderId);
  form.set("customer_email", brief.email);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(amountCents));
  form.set("line_items[0][price_data][product_data][name]", service.title);
  form.set("line_items[0][price_data][product_data][description]", `${service.result}${service.recurrence ? " · ciclo mensual" : ""}`);
  form.set("metadata[order_id]", orderId);
  form.set("metadata[offer_version]", "1");
  form.set("metadata[recurrence]", service.recurrence?.cadence ?? "one_time");
  form.set("payment_intent_data[metadata][order_id]", orderId);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${runtimeEnv.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `checkout:${orderId}:1`,
    },
    body: form,
  });
  const stripePayload = await stripeResponse.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !stripePayload.id || !stripePayload.url) {
    await runtimeEnv.DB.prepare("UPDATE orders SET payment_status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(orderId).run();
    return Response.json({ error: stripePayload.error?.message ?? "Stripe no pudo abrir el checkout." }, { status: 502 });
  }

  await runtimeEnv.DB.prepare("UPDATE orders SET payment_status = 'pending', stripe_session_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(stripePayload.id, orderId).run();
  return Response.json({ url: stripePayload.url, orderCode: humanCode });
}
