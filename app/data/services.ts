import { expandedServices } from "./expanded-services";
import { recurringServices } from "./recurring-services";

export type ServiceCategory =
  | "Presentaciones"
  | "Videos"
  | "Documentos"
  | "Diseño"
  | "Herramientas";

export type ServiceIntent = "Trabajo" | "Estudio" | "Personal" | "Tech";

export type ChizpaService = {
  id: string;
  title: string;
  shortTitle: string;
  category: ServiceCategory;
  description: string;
  result: string;
  price: number;
  hours: 24 | 48 | 72;
  revisions: number;
  icon: "presentation" | "video" | "document" | "palette" | "workflow";
  examples: string[];
  includes: string[];
  needs: string[];
  accent: "purple" | "orange" | "lavender" | "cream";
  recurrence?: {
    cadence: "monthly";
    label: string;
  };
};

const coreServices: ChizpaService[] = [
  {
    id: "ppt-directorio", title: "PPT de directorio", shortTitle: "Directorio listo", category: "Presentaciones",
    description: "Convierte datos, informes y avances en una historia ejecutiva clara.",
    result: "Hasta 12 slides editables, listas para presentar", price: 119, hours: 72, revisions: 1, icon: "presentation",
    examples: ["Resultados trimestrales", "Plan estratégico", "Update de proyecto"],
    includes: ["Estructura narrativa", "Diseño completo", "PPTX + PDF", "1 ajuste"],
    needs: ["Contenido base", "Logo o plantilla", "Objetivo de la reunión"], accent: "orange",
  },
  {
    id: "pitch-deck", title: "Pitch que prende", shortTitle: "Pitch deck", category: "Presentaciones",
    description: "Una presentación para vender tu idea, negocio o proyecto sin dar vueltas.",
    result: "Hasta 10 slides con narrativa, diseño y cierre", price: 129, hours: 72, revisions: 1, icon: "presentation",
    examples: ["Levantar inversión", "Vender un proyecto", "Presentar una startup"],
    includes: ["Storyline", "Copy ejecutivo", "Diseño", "PPTX + PDF"],
    needs: ["Idea o material base", "Audiencia", "Meta del pitch"], accent: "lavender",
  },
  {
    id: "presentacion-academica", title: "Presentación académica", shortTitle: "Presentación académica", category: "Presentaciones",
    description: "Defensa, clase o trabajo final explicado con claridad y muy bien presentado.",
    result: "Hasta 12 slides editables + notas para exponer", price: 59, hours: 72, revisions: 1, icon: "presentation",
    examples: ["Defensa de tesis", "Seminario", "Trabajo de universidad"],
    includes: ["Síntesis", "Orden del relato", "Diseño", "Notas del presentador"],
    needs: ["Documento o investigación", "Pauta", "Tiempo de exposición"], accent: "cream",
  },
  {
    id: "video-recuerdo", title: "Video de un gran momento", shortTitle: "Video recuerdo", category: "Videos",
    description: "Tus fotos y clips convertidos en una pieza emocionante, sin editar por semanas.",
    result: "Video de hasta 2 minutos listo para compartir", price: 89, hours: 72, revisions: 1, icon: "video",
    examples: ["Matrimonio", "Cumpleaños", "Aniversario", "Viaje"],
    includes: ["Edición", "Música", "Textos", "Formato horizontal o vertical"],
    needs: ["Fotos y clips", "Canción o estilo", "Nombres y fecha"], accent: "orange",
  },
  {
    id: "video-corto", title: "Video corto que prende", shortTitle: "Video corto", category: "Videos",
    description: "Una idea convertida en un video de hasta 30 segundos con imágenes, edición y sonido.",
    result: "1 video terminado + 2 formatos de salida", price: 79, hours: 72, revisions: 1, icon: "video",
    examples: ["Invitación", "Anuncio", "Teaser", "Contenido social"],
    includes: ["Concepto", "Creación visual", "Edición", "Música y subtítulos"],
    needs: ["Objetivo", "Referencias", "Textos obligatorios"], accent: "purple",
  },
  {
    id: "documento-pro", title: "Documento pro", shortTitle: "Documento pro", category: "Documentos",
    description: "Ordenamos, editamos y diseñamos ese documento que necesita verse impecable.",
    result: "Hasta 12 páginas editadas, diagramadas y listas", price: 69, hours: 72, revisions: 1, icon: "document",
    examples: ["Informe", "Whitepaper", "Propuesta", "Trabajo académico"],
    includes: ["Edición de estilo", "Jerarquía", "Diseño", "DOCX + PDF"],
    needs: ["Borrador base", "Pauta o estructura", "Fuentes si aplica"], accent: "lavender",
  },
  {
    id: "tesis-en-orden", title: "Tesis en orden", shortTitle: "Tesis en orden", category: "Documentos",
    description: "Estructura, edición y claridad para avanzar con tu propio trabajo académico.",
    result: "Diagnóstico + edición de hasta 20 páginas + plan de avance", price: 79, hours: 72, revisions: 1, icon: "document",
    examples: ["Marco teórico", "Edición formal", "Coherencia y estructura"],
    includes: ["Revisión editorial", "Observaciones", "Formato", "Plan de mejoras"],
    needs: ["Tu borrador", "Rúbrica académica", "Norma de citación"], accent: "cream",
  },
  {
    id: "diseno-express", title: "Diseño express", shortTitle: "Diseño express", category: "Diseño",
    description: "Una pieza visual bien resuelta para imprimir, publicar, invitar o explicar.",
    result: "1 diseño maestro + 2 adaptaciones listas para usar", price: 49, hours: 48, revisions: 1, icon: "palette",
    examples: ["Invitación", "Afiche", "Infografía", "Portada"],
    includes: ["Dirección visual", "Diseño", "Adaptaciones", "Archivos finales"],
    needs: ["Texto", "Formato", "Referencias si tienes"], accent: "orange",
  },
  {
    id: "landing-express", title: "Landing express", shortTitle: "Landing express", category: "Diseño",
    description: "Una página clara y convincente para tu idea, evento, producto o campaña.",
    result: "Landing responsive de hasta 5 secciones publicada", price: 199, hours: 72, revisions: 1, icon: "palette",
    examples: ["Evento", "Producto", "Portafolio", "Captura de leads"],
    includes: ["Copy", "Diseño", "Desarrollo", "Publicación temporal"],
    needs: ["Objetivo", "Material de marca", "CTA principal"], accent: "purple",
  },
  {
    id: "automatizacion-simple", title: "Automatización simple", shortTitle: "Automatización", category: "Herramientas",
    description: "Conectamos pasos repetitivos para que dejes de hacerlos a mano.",
    result: "1 trigger, hasta 3 acciones y 2 plataformas", price: 149, hours: 72, revisions: 1, icon: "workflow",
    examples: ["Formulario a planilla", "Alertas", "Resumen automático", "Follow-up"],
    includes: ["Diseño del flujo", "Configuración", "Pruebas", "Guía de uso"],
    needs: ["Proceso actual", "Herramientas involucradas", "Accesos seguros"], accent: "lavender",
  },
  {
    id: "mini-herramienta", title: "Mini herramienta", shortTitle: "Mini herramienta", category: "Herramientas",
    description: "Un prototipo funcional para calcular, organizar, presentar o capturar información.",
    result: "Herramienta web de una función, publicada y usable", price: 299, hours: 72, revisions: 1, icon: "workflow",
    examples: ["Calculadora", "Formulario inteligente", "Dashboard simple", "Simulador"],
    includes: ["UX", "Interfaz", "Desarrollo", "Publicación temporal"],
    needs: ["Problema a resolver", "Datos de entrada", "Resultado esperado"], accent: "cream",
  },
];

export const services: ChizpaService[] = [...coreServices, ...expandedServices, ...recurringServices];
export { expandedServices, recurringServices };

export const categories = ["Todo", "Presentaciones", "Videos", "Documentos", "Diseño", "Herramientas"] as const;

const defaultIntents: Record<ServiceCategory, ServiceIntent[]> = {
  Presentaciones: ["Trabajo"],
  Videos: ["Personal"],
  Documentos: ["Trabajo"],
  Diseño: ["Trabajo"],
  Herramientas: ["Trabajo", "Tech"],
};

const intentOverrides: Partial<Record<string, ServiceIntent[]>> = {
  "presentacion-academica": ["Estudio"],
  "deck-capacitacion": ["Trabajo", "Estudio"],
  "masterclass-deck": ["Trabajo", "Estudio"],
  "portfolio-presentacion": ["Trabajo", "Estudio"],
  "video-corto": ["Trabajo", "Personal"],
  "reel-desde-material": ["Trabajo", "Personal"],
  "demo-producto-video": ["Trabajo"],
  "tutorial-pantalla": ["Trabajo", "Tech"],
  "clips-podcast": ["Trabajo", "Personal"],
  "testimonial-editado": ["Trabajo"],
  "logo-animado": ["Trabajo"],
  "resumen-evento": ["Trabajo", "Personal"],
  "documento-pro": ["Trabajo", "Estudio"],
  "tesis-en-orden": ["Estudio"],
  "cv-linkedin": ["Trabajo", "Estudio"],
  "correccion-academica": ["Estudio"],
  "referencias-apa": ["Estudio"],
  "guia-estudio": ["Estudio"],
  "postulacion-fondo": ["Estudio", "Trabajo"],
  "diseno-express": ["Trabajo", "Estudio", "Personal"],
  "landing-express": ["Trabajo", "Personal", "Tech"],
  "invitacion-evento": ["Personal"],
  "cv-visual": ["Trabajo", "Estudio"],
  "portada-ebook": ["Trabajo", "Estudio"],
  "portada-podcast": ["Trabajo", "Personal"],
  "kit-matrimonio-digital": ["Personal"],
  "mini-identidad": ["Trabajo", "Personal"],
  "grafica-merch": ["Trabajo", "Personal"],
  "resultados-del-mes": ["Trabajo"],
  "clases-del-mes": ["Trabajo", "Estudio"],
  "videos-del-mes": ["Trabajo", "Personal"],
  "podcast-en-clips-mensual": ["Trabajo", "Personal"],
  "tu-mes-en-video": ["Personal"],
  "newsletter-mensual": ["Trabajo", "Personal"],
  "minutas-semanales": ["Trabajo"],
  "social-media-automatico": ["Trabajo"],
  "pack-visual-mensual": ["Trabajo", "Personal"],
  "dashboard-al-dia": ["Trabajo", "Tech"],
  "automatizacion-cuidada": ["Trabajo", "Tech"],
};

export function getServiceIntents(service: ChizpaService): ServiceIntent[] {
  return intentOverrides[service.id] ?? defaultIntents[service.category];
}

export function getService(id: string | null | undefined) {
  return services.find((service) => service.id === id) ?? services[0];
}
