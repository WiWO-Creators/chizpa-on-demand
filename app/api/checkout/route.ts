import { z } from "zod";
import { calculateChizpaScore, classifyProject } from "../../lib/classify";
import { env } from "../../lib/runtime-env";
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

const MAX_FILES = 5;
const MAX_FILE_BYTES = 4 * 1024 * 1024;
const MAX_TOTAL_BYTES = 8 * 1024 * 1024;
const allowedExtensions = new Set(["ppt", "pptx", "doc", "docx", "xls", "xlsx", "pdf", "png", "jpg", "jpeg", "webp", "mp3", "wav", "mp4", "mov", "zip"]);

function fileExtension(name: string) {
  return name.split(".").pop()?.toLocaleLowerCase("es") ?? "";
}

function stripeKey() {
  const key = env("STRIPE_SECRET_KEY");
  if (key?.startsWith("sk_") || key?.startsWith("rk_")) return key;
  return undefined;
}

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
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

  const key = stripeKey();
  if (!key) {
    return Response.json({
      error: "Stripe todavía no está configurado en este entorno.",
      code: "stripe_not_configured",
    }, { status: 503 });
  }

  const orderId = crypto.randomUUID();
  const humanCode = `CHZ-${orderId.slice(0, 6).toUpperCase()}`;
  const amountCents = service.price * 100;
  const score = calculateChizpaScore(brief);
  const recurring = Boolean(service.recurrence);
  const requestOrigin = new URL(request.url).origin;
  const baseUrl = env("APP_BASE_URL")?.replace(/\/$/, "") || requestOrigin;
  const fileNames = files.map((file) => file.name).join(", ");

  const form = new URLSearchParams();
  form.set("mode", recurring ? "subscription" : "payment");
  form.set("success_url", `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${baseUrl}/start?service=${encodeURIComponent(service.id)}`);
  form.set("client_reference_id", orderId);
  form.set("customer_email", brief.email);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(amountCents));
  form.set("line_items[0][price_data][product_data][name]", service.title);
  form.set("line_items[0][price_data][product_data][description]", clip(`${service.result}${recurring ? " · ciclo mensual" : ""}`, 240));
  if (recurring) form.set("line_items[0][price_data][recurring][interval]", "month");
  form.set("metadata[order_id]", orderId);
  form.set("metadata[human_code]", humanCode);
  form.set("metadata[service_id]", service.id);
  form.set("metadata[email]", clip(brief.email, 320));
  form.set("metadata[idea]", clip(brief.idea, 450));
  form.set("metadata[score]", String(score));
  form.set("metadata[files]", clip(fileNames, 400));
  form.set("metadata[recurrence]", service.recurrence?.cadence ?? "one_time");
  if (!recurring) form.set("payment_intent_data[metadata][order_id]", orderId);

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": `checkout:${orderId}:1`,
    },
    body: form,
  });
  const stripePayload = await stripeResponse.json() as { id?: string; url?: string; error?: { message?: string } };
  if (!stripeResponse.ok || !stripePayload.id || !stripePayload.url) {
    return Response.json({ error: stripePayload.error?.message ?? "Stripe no pudo abrir el checkout." }, { status: 502 });
  }

  return Response.json({ url: stripePayload.url, orderCode: humanCode });
}
