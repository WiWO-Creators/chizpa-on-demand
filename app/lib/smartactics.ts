import { classifyProject } from "./classify";
import { services, type ChizpaService } from "../data/services";

export type RawTactic = {
  title: string;
  why: string;
  serviceId: string;
};

export type HydratedTactic = {
  title: string;
  why: string;
  serviceId: string;
  serviceTitle: string;
  category: ChizpaService["category"];
  result: string;
  price: number;
  hours: ChizpaService["hours"];
  recurrence?: string;
  fromPrice: boolean;
  href: string;
};

export type SmartacticsPlan = {
  headline: string;
  read: string;
  tactics: HydratedTactic[];
  source: "grok" | "fallback";
};

const pricedFromIds = new Set(["landing-express", "automatizacion-simple", "mini-herramienta"]);

const pairCategory: Record<ChizpaService["category"], ChizpaService["category"]> = {
  Presentaciones: "Documentos",
  Documentos: "Presentaciones",
  Videos: "Diseño",
  Diseño: "Videos",
  Herramientas: "Documentos",
};

const whyByCategory: Record<ChizpaService["category"], string> = {
  Presentaciones: "Para que lo que tienes se pueda presentar y decidir, no solo leer.",
  Videos: "Para que el proyecto se mueva y se pueda compartir sin que tú edites.",
  Documentos: "Para dejar el contenido ordenado, claro y listo para usar.",
  Diseño: "Para que se vea intencional desde el primer envío.",
  Herramientas: "Para dejar de hacerlo a mano y que el flujo quede armado.",
};

export function compactCatalog() {
  return services
    .map((service) =>
      [
        service.id,
        service.title,
        service.category,
        `US$${service.price}${service.recurrence ? "/mes" : ""}`,
        `${service.hours}h`,
        service.result,
      ].join(" | "),
    )
    .join("\n");
}

export function catalogIdSet() {
  return new Set(services.map((service) => service.id));
}

export function startHref(serviceId: string, idea: string) {
  const params = new URLSearchParams({ service: serviceId, idea: idea.slice(0, 800) });
  return `/start?${params.toString()}`;
}

export function hydrateTactics(idea: string, raw: RawTactic[]): HydratedTactic[] {
  const seen = new Set<string>();
  const tactics: HydratedTactic[] = [];

  for (const item of raw) {
    const service = services.find((entry) => entry.id === item.serviceId);
    if (!service || seen.has(service.id)) continue;
    seen.add(service.id);
    const title = cleanLine(item.title, 72) || service.shortTitle;
    const why = cleanLine(item.why, 140) || whyByCategory[service.category];
    tactics.push(toHydrated(service, title, why, idea));
    if (tactics.length >= 3) break;
  }

  return tactics;
}

export function fallbackPlan(idea: string): SmartacticsPlan {
  const classified = classifyProject(idea);
  const primary = classified.recommendedService ?? services[0];
  const picks = [primary];

  const wantsRecurring = /mensual|cada mes|todos los meses|recurrente|siempre/.test(idea.toLocaleLowerCase("es"));
  const pair = services.find((service) =>
    service.category === pairCategory[primary.category]
    && service.id !== primary.id
    && !service.recurrence,
  );
  const same = services.find((service) =>
    service.category === primary.category
    && service.id !== primary.id
    && !service.recurrence,
  );
  const recurring = wantsRecurring
    ? services.find((service) => service.recurrence && (service.category === primary.category || service.category === pairCategory[primary.category]))
    : undefined;

  for (const candidate of [pair, same, recurring]) {
    if (candidate && !picks.some((item) => item.id === candidate.id)) picks.push(candidate);
    if (picks.length >= 3) break;
  }

  const tactics = picks.slice(0, 3).map((service, index) => {
    const title = index === 0
      ? `Parte por ${service.shortTitle.toLocaleLowerCase("es")}`
      : `Suma ${service.shortTitle.toLocaleLowerCase("es")}`;
    const why = index === 0
      ? `Esto cubre el resultado principal de lo que contaste.`
      : `Complementa la Chizpa principal para que el proyecto quede usable de verdad.`;
    return toHydrated(service, title, why, idea);
  });

  return {
    headline: classified.recommendedService
      ? `Para esto, la primera compra es ${primary.title}.`
      : "Esto cabe en Chizpas concretas. Elige una y parte.",
    read: classified.explanation,
    tactics,
    source: "fallback",
  };
}

function toHydrated(service: ChizpaService, title: string, why: string, idea: string): HydratedTactic {
  return {
    title,
    why,
    serviceId: service.id,
    serviceTitle: service.title,
    category: service.category,
    result: service.result,
    price: service.price,
    hours: service.hours,
    recurrence: service.recurrence?.label,
    fromPrice: pricedFromIds.has(service.id),
    href: startHref(service.id, idea),
  };
}

function cleanLine(value: string, max: number) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}
