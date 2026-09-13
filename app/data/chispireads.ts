export type ChispiReadSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  tip?: string;
};

export type ChispiRead = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  dek: string;
  category: "Presentaciones" | "Videos" | "Documentos" | "Diseño" | "Automatización";
  readTime: string;
  updatedAt: string;
  art: string;
  accent: "purple" | "orange" | "lime" | "lavender";
  serviceId: string;
  serviceTitle: string;
  intro: string[];
  takeaways: string[];
  sections: ChispiReadSection[];
  faq: { question: string; answer: string }[];
};

export const chispireads: ChispiRead[] = [
  {
    slug: "como-hacer-presentacion-directorio",
    title: "Cómo hacer una presentación de directorio que vaya al punto",
    seoTitle: "Cómo hacer una presentación de directorio en 7 pasos",
    description: "Guía práctica para convertir datos y avances en una presentación de directorio clara, ejecutiva y lista para decidir.",
    dek: "Deja el reporte infinito. Ordena la decisión, el dato y la historia en una presentación que un directorio pueda entender rápido.",
    category: "Presentaciones",
    readTime: "8 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-laptop.webp",
    accent: "orange",
    serviceId: "ppt-directorio",
    serviceTitle: "PPT de directorio",
    intro: [
      "Una presentación de directorio no es un informe pegado en PowerPoint. Es una herramienta para entender qué pasó, qué importa y qué decisión se necesita tomar.",
      "El error más común es partir diseñando slides. El orden correcto es definir la conversación, elegir la evidencia y recién entonces construir la presentación.",
    ],
    takeaways: ["Una idea principal por slide", "Datos con contexto, no tablas completas", "Un cierre que pida decisiones concretas"],
    sections: [
      { heading: "1. Define la decisión antes de abrir PowerPoint", paragraphs: ["Escribe en una frase qué debería entender o resolver el directorio al terminar. Si necesitas varias decisiones, ordénalas por impacto. Esa frase será el filtro para todo lo que entre o salga."], bullets: ["Qué cambió desde la última sesión", "Qué riesgo u oportunidad requiere atención", "Qué decisión o respaldo necesitas"], tip: "Si una slide no ayuda a entender, decidir o actuar, probablemente sobra." },
      { heading: "2. Construye un relato ejecutivo", paragraphs: ["La estructura más útil suele ser simple: contexto, resultado, explicación, implicancia y próximos pasos. El directorio debe poder seguir la historia incluso si solo lee los títulos."], bullets: ["Portada con periodo y tema", "Resumen ejecutivo de una página", "Resultados versus meta", "Tres hallazgos relevantes", "Decisiones y próximos pasos"] },
      { heading: "3. Reduce los datos a señales", paragraphs: ["No copies el dashboard completo. Selecciona los indicadores que prueban tu argumento y agrega una referencia: meta, periodo anterior o benchmark. Un número aislado informa poco; una variación explicada ayuda a decidir."], bullets: ["Destaca la tendencia, no cada dato", "Usa el mismo criterio de color en todo el deck", "Escribe la conclusión arriba del gráfico"] },
      { heading: "4. Escribe títulos que ya cuenten la historia", paragraphs: ["Cambia títulos genéricos como “Resultados comerciales” por mensajes como “Crecimos 18%, pero la rentabilidad cayó en dos canales”. El título debe funcionar como la conclusión de la slide."], tip: "Haz una lectura solo de títulos. Si el relato se entiende, la estructura está funcionando." },
      { heading: "5. Diseña para una conversación, no para decorar", paragraphs: ["Usa tipografía grande, aire y jerarquía. Limita la paleta, evita fondos que compitan con los datos y conserva elementos de marca solo cuando aportan orientación."], bullets: ["Título entre 28 y 36 pt", "Cuerpo legible a distancia", "Máximo un gráfico principal por slide", "Notas del presentador para el detalle"] },
      { heading: "6. Cierra con decisiones y responsables", paragraphs: ["La última parte debe dejar claro qué se aprobó, qué falta resolver, quién será responsable y cuándo se revisará nuevamente. Así la presentación se convierte en una herramienta de gestión."], bullets: ["Decisión solicitada", "Recomendación del equipo", "Responsable", "Fecha o siguiente hito"] },
      { heading: "7. Haz una prueba de diez minutos", paragraphs: ["Presenta el deck en voz alta y mide el tiempo. Elimina repeticiones, prepara respuestas para los datos sensibles y lleva los anexos fuera del flujo principal. La versión final debe sentirse más corta que la reunión, no más larga."], tip: "Para una reunión de 30 minutos, prepara una exposición de 10 a 15 minutos y deja espacio para discutir." },
    ],
    faq: [
      { question: "¿Cuántas slides debería tener una presentación de directorio?", answer: "Entre 8 y 15 slides suele ser suficiente para una actualización ejecutiva. El número correcto depende de las decisiones que se deban tomar, no del volumen de información disponible." },
      { question: "¿Conviene incluir anexos?", answer: "Sí. Lleva tablas completas, metodología y detalle operativo a un anexo. El flujo principal debe concentrarse en hallazgos, implicancias y decisiones." },
      { question: "¿Qué formato es mejor para entregar?", answer: "PPTX para editar y presentar, más un PDF para compartir una versión estable. Mantén fuentes y gráficos compatibles con el equipo que la usará." },
    ],
  },
  {
    slug: "como-crear-reels-producto",
    title: "Cómo crear 4 reels de producto sin improvisar cada semana",
    seoTitle: "Cómo crear reels de producto: plan mensual paso a paso",
    description: "Aprende a planificar, grabar y editar cuatro reels de producto al mes con un sistema simple y repetible.",
    dek: "Cuatro ideas distintas, una sola sesión de materiales y un sistema que puedes repetir cada mes.",
    category: "Videos",
    readTime: "7 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-director.webp",
    accent: "lime",
    serviceId: "social-media-automatico",
    serviceTitle: "Social Media Automático",
    intro: ["Un reel de producto no necesita una gran producción para funcionar. Necesita mostrar algo concreto, sostener una sola idea y darle a la persona una razón para mirar hasta el final.", "La forma más eficiente de producir contenido constante es trabajar por ciclos: definir cuatro ángulos, reunir materiales una vez y adaptar cada pieza a un objetivo diferente."],
    takeaways: ["Cuatro reels con funciones distintas", "Material organizado en una sola sesión", "Mensajes breves y fáciles de entender"],
    sections: [
      { heading: "1. Elige cuatro trabajos para tus reels", paragraphs: ["No publiques cuatro versiones del mismo anuncio. Asigna una función a cada pieza para cubrir distintas preguntas del cliente."], bullets: ["Descubrimiento: qué es el producto", "Demostración: cómo funciona", "Prueba: por qué confiar", "Acción: oferta, lanzamiento o llamada a comprar"] },
      { heading: "2. Define una idea por video", paragraphs: ["Resume cada reel en una frase. Si la explicación necesita varios “y además”, divídela. Una pieza breve funciona mejor cuando resuelve una sola curiosidad."], tip: "Prueba este formato: “Para personas que ___, este producto ayuda a ___ porque ___”." },
      { heading: "3. Prepara una mini biblioteca de materiales", paragraphs: ["Graba o reúne planos que puedas reutilizar. Mantén encuadres limpios y deja espacio para texto. No dependas de una sola toma perfecta."], bullets: ["Producto completo y detalles", "Uso real en manos de una persona", "Antes y después si corresponde", "Packaging, textura y variaciones", "Logo, colores y referencias de marca"] },
      { heading: "4. Atrapa la atención en los primeros dos segundos", paragraphs: ["Abre con el resultado, una pregunta específica o un detalle visual. Evita introducciones largas, logos animados y frases que podrían servir para cualquier marca."], bullets: ["Muestra el producto en acción", "Usa una comparación visible", "Escribe una promesa comprobable", "Plantea un problema reconocible"] },
      { heading: "5. Edita para entender sin sonido", paragraphs: ["Muchas personas verán el reel sin audio. Usa subtítulos breves, jerarquía clara y cortes que acompañen el mensaje. La música suma ritmo, pero no debe cargar con la explicación."], tip: "Lee solo los textos sobreimpresos. Si cuentan la historia completa, el video está preparado para consumo móvil." },
      { heading: "6. Adapta el cierre al objetivo", paragraphs: ["No todos los videos deben decir “compra ahora”. Un reel de demostración puede cerrar con “mira los tamaños”, mientras uno de prueba puede invitar a revisar opiniones o resultados."], bullets: ["Comprar o cotizar", "Guardar para después", "Compartir", "Ver catálogo", "Escribir por mensaje"] },
      { heading: "7. Aprende del ciclo y repite", paragraphs: ["Mide retención, reproducciones completas, guardados, clics y preguntas recibidas. El objetivo no es perseguir cada tendencia, sino descubrir qué ángulos merecen una segunda versión."], tip: "Conserva una plantilla de brief, nombres de archivos y métricas. El segundo mes debería ser más fácil que el primero." },
    ],
    faq: [
      { question: "¿Cuánto debería durar un reel de producto?", answer: "Entre 10 y 30 segundos funciona bien para una demostración simple. Usa más tiempo solo si el producto requiere explicar pasos importantes." },
      { question: "¿Necesito grabar material nuevo todos los meses?", answer: "No siempre. Una biblioteca bien grabada puede alimentar varios ciclos, combinada con nuevos textos, usos, ofertas y pruebas sociales." },
      { question: "¿Qué necesito entregar para producir los reels?", answer: "Fotos o videos del producto, mensajes prioritarios, identidad visual, restricciones de marca y referencias del estilo que buscas." },
    ],
  },
  {
    slug: "como-hacer-video-matrimonio",
    title: "Cómo convertir recuerdos de un matrimonio en un video emocionante",
    seoTitle: "Cómo hacer un video de matrimonio emocionante paso a paso",
    description: "Ordena fotos y clips de un matrimonio y conviértelos en un video emotivo, breve y fácil de compartir.",
    dek: "La emoción no aparece por poner todas las fotos. Aparece cuando eliges, ordenas y dejas respirar los momentos correctos.",
    category: "Videos",
    readTime: "6 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-flowers.webp",
    accent: "orange",
    serviceId: "video-recuerdo",
    serviceTitle: "Video de un gran momento",
    intro: ["Un buen video de matrimonio no intenta documentar cada minuto. Selecciona los momentos que reconstruyen la energía del día y los conecta con una canción, una voz o una idea.", "Antes de editar, decide para quién es el video y cuándo se verá. Un regalo privado, una publicación y una proyección durante la fiesta necesitan ritmos diferentes."],
    takeaways: ["Una historia breve con principio y cierre", "Material seleccionado sin repeticiones", "Música y textos que acompañan, no invaden"],
    sections: [
      { heading: "1. Define el momento de uso", paragraphs: ["Especifica si será una sorpresa, un recuerdo posterior o una pieza para redes. Esto determina duración, formato y cuánto contexto necesita la audiencia."], bullets: ["Proyección: horizontal y legible a distancia", "Redes: vertical y ritmo rápido", "Regalo: puede ser más íntimo y personal"] },
      { heading: "2. Reúne todo antes de seleccionar", paragraphs: ["Crea una carpeta única y pide a las personas importantes que suban material original. Evita archivos reenviados por mensajería, porque pierden calidad."], tip: "Nombra las carpetas por momento: preparación, ceremonia, celebración, mensajes y cierre." },
      { heading: "3. Elige una columna emocional", paragraphs: ["Puede ser una canción, una promesa, un mensaje de voz o una secuencia cronológica. Esa columna te ayuda a decidir qué material entra y en qué orden."], bullets: ["Inicio que sitúa el momento", "Detalles y miradas", "Personas importantes", "Punto de máxima emoción", "Cierre que deja una sensación"] },
      { heading: "4. Selecciona menos y mejor", paragraphs: ["Descarta duplicados, clips movidos y fotos casi iguales. Busca variedad de planos, gestos y personas. Una imagen imperfecta puede quedarse si contiene un momento irrepetible."], tip: "Para un video de dos minutos, 25 a 45 recursos suelen ser suficientes." },
      { heading: "5. Edita siguiendo la música", paragraphs: ["Usa los cambios de intensidad para mover la historia. No cortes en cada golpe: alterna secuencias rápidas con momentos que puedan respirar."], bullets: ["Evita transiciones llamativas sin motivo", "Corrige color para dar continuidad", "Baja la música cuando haya voces", "Usa textos cortos y fechas correctas"] },
      { heading: "6. Revisa nombres, fechas y ausencias", paragraphs: ["Antes de entregar, confirma que las personas esenciales estén representadas, que los nombres estén bien escritos y que no haya una escena que pueda incomodar. La revisión emocional es tan importante como la técnica."] },
    ],
    faq: [
      { question: "¿Cuánto debe durar un video de matrimonio?", answer: "Entre 90 segundos y 3 minutos suele funcionar para compartir. Una proyección durante el evento puede extenderse si incorpora mensajes o una historia previa." },
      { question: "¿Qué formato conviene?", answer: "Horizontal para pantallas y proyección; vertical para reels y stories. Si tendrá ambos usos, planifica encuadres que permitan adaptar la edición." },
      { question: "¿Puedo usar cualquier canción?", answer: "Para uso privado hay más flexibilidad. Para publicar en plataformas, usa música disponible en su biblioteca o con los permisos correspondientes." },
    ],
  },
  {
    slug: "como-ordenar-una-tesis",
    title: "Cómo ordenar una tesis sin perder tu voz",
    seoTitle: "Cómo ordenar una tesis: estructura y revisión paso a paso",
    description: "Método práctico para revisar la estructura, coherencia y formato de una tesis manteniendo la autoría del estudiante.",
    dek: "Una tesis clara no nace de escribir más. Nace de saber qué pregunta responde cada parte y cómo se conectan entre sí.",
    category: "Documentos",
    readTime: "9 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-meditate.webp",
    accent: "lavender",
    serviceId: "tesis-en-orden",
    serviceTitle: "Tesis en orden",
    intro: ["Ordenar una tesis no significa reemplazar el trabajo del estudiante. Significa hacer visible la lógica de la investigación, detectar vacíos y mejorar la forma en que se comunica lo que ya fue investigado.", "Trabaja siempre con la pauta de tu institución y conserva versiones. La coherencia académica importa más que hacer que el texto suene artificialmente complejo."],
    takeaways: ["Una pregunta de investigación visible", "Capítulos con función clara", "Citas y formato revisados con método"],
    sections: [
      { heading: "1. Vuelve a la pregunta de investigación", paragraphs: ["Escribe la pregunta, el objetivo general y la respuesta principal en una sola página. Luego comprueba que la introducción, el método, los resultados y la discusión trabajen para responderla."], tip: "Si no puedes resumir el aporte en tres frases, todavía hay un problema de foco." },
      { heading: "2. Asigna una función a cada capítulo", paragraphs: ["Crea un mapa del documento antes de editar párrafos. Anota qué debe demostrar cada capítulo y qué evidencia utiliza."], bullets: ["Introducción: problema, relevancia y ruta", "Marco teórico: conceptos que permiten analizar", "Metodología: cómo obtuviste y trataste la evidencia", "Resultados: qué encontraste", "Discusión: qué significa y cómo responde la pregunta"] },
      { heading: "3. Revisa la coherencia entre títulos y contenido", paragraphs: ["Los títulos deben anticipar lo que realmente ocurre en la sección. Reubica párrafos que desarrollan otra idea y elimina repeticiones que solo cambian de palabras."], tip: "Lee el índice como si fuera el resumen. ¿Se entiende el recorrido de la investigación?" },
      { heading: "4. Edita por capas", paragraphs: ["No intentes corregir todo a la vez. Haz pasadas separadas para argumento, estructura, claridad, citas y formato. Esto reduce errores y evita quedar atrapado perfeccionando una frase que luego será eliminada."], bullets: ["Primera pasada: lógica", "Segunda: orden de párrafos", "Tercera: frases y precisión", "Cuarta: referencias", "Quinta: formato final"] },
      { heading: "5. Haz visibles las conexiones", paragraphs: ["Agrega cierres breves que expliquen qué deja cada sección y aperturas que muestren por qué la siguiente es necesaria. La lectura debe avanzar, no saltar entre bloques aislados."] },
      { heading: "6. Controla citas y bibliografía", paragraphs: ["Usa una sola norma y revisa correspondencia: cada cita del texto debe estar en la bibliografía y cada referencia listada debe haber sido citada. Confirma autores, años, enlaces y DOI cuando corresponda."], tip: "Un gestor bibliográfico ayuda, pero no reemplaza la revisión final de consistencia." },
      { heading: "7. Prepara una lista de observaciones accionables", paragraphs: ["Transforma comentarios vagos como “falta profundidad” en tareas: agregar evidencia, contrastar autores, justificar una decisión metodológica o conectar el resultado con el objetivo. Trabaja una lista cerrada por versión."] },
    ],
    faq: [
      { question: "¿Editar una tesis afecta la autoría?", answer: "La edición debe mejorar claridad, estructura y formato sin inventar evidencia ni reemplazar el razonamiento del estudiante. Las decisiones académicas y el contenido son responsabilidad del autor." },
      { question: "¿Por dónde conviene empezar la revisión?", answer: "Empieza por la pregunta, los objetivos y el índice. Corregir estilo antes de resolver la estructura suele generar trabajo que luego se pierde." },
      { question: "¿Cuántas páginas se pueden revisar en 72 horas?", answer: "Depende del nivel de intervención. Una revisión profunda de hasta 20 páginas permite entregar observaciones más útiles que una corrección superficial de un documento completo." },
    ],
  },
  {
    slug: "como-automatizar-tarea-repetitiva",
    title: "Cómo automatizar una tarea repetitiva sin crear otro problema",
    seoTitle: "Cómo automatizar una tarea repetitiva paso a paso",
    description: "Aprende a elegir, diseñar y probar una automatización simple entre formularios, planillas, correos y alertas.",
    dek: "Primero entiende el proceso. Después conecta las herramientas. La mejor automatización es la que puedes explicar y revisar.",
    category: "Automatización",
    readTime: "8 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-point.webp",
    accent: "purple",
    serviceId: "automatizacion-simple",
    serviceTitle: "Automatización simple",
    intro: ["Automatizar no es mover un problema más rápido. Antes de conectar herramientas, necesitas entender qué dispara el proceso, qué datos viajan y qué debe pasar cuando algo falla.", "Empieza con un flujo pequeño, frecuente y de bajo riesgo. Una automatización simple bien documentada genera más valor que un sistema enorme que nadie sabe mantener."],
    takeaways: ["Un disparador y un resultado claros", "Datos mínimos y bien definidos", "Pruebas, alertas y responsable"],
    sections: [
      { heading: "1. Elige una tarea candidata", paragraphs: ["Busca algo repetitivo, basado en reglas y con entradas consistentes. Evita comenzar por decisiones sensibles o procesos que cambian todas las semanas."], bullets: ["Copiar datos desde un formulario", "Enviar una alerta al recibir una solicitud", "Crear una tarea desde un correo", "Actualizar una planilla", "Enviar un resumen programado"] },
      { heading: "2. Dibuja el proceso actual", paragraphs: ["Escribe cada paso desde el evento inicial hasta el resultado. Identifica esperas, decisiones, personas y herramientas. Marca qué pasos necesitan criterio humano."], tip: "Usa la frase: “Cuando ocurre X, si se cumple Y, entonces hacemos Z”." },
      { heading: "3. Define datos de entrada y salida", paragraphs: ["Lista los campos necesarios, su formato y qué hacer si falta información. Mantén el flujo con la menor cantidad de datos posible y evita transportar información sensible sin necesidad."], bullets: ["Nombre exacto del campo", "Tipo de dato", "Campo obligatorio u opcional", "Destino", "Regla de validación"] },
      { heading: "4. Diseña el camino feliz y los errores", paragraphs: ["El camino feliz muestra qué ocurre cuando todo funciona. Luego define excepciones: duplicados, correo inválido, permiso vencido o servicio caído."], tip: "Una automatización sin alerta de error es una tarea manual escondida." },
      { heading: "5. Conecta pocas acciones", paragraphs: ["Para un primer flujo, limita el alcance a un disparador y hasta tres acciones. Nombra cada paso de forma comprensible y documenta las cuentas o permisos involucrados."] },
      { heading: "6. Prueba con casos reales y extremos", paragraphs: ["Usa registros correctos, incompletos, duplicados y con caracteres especiales. Comprueba que el resultado sea trazable y que el flujo no cree acciones dobles al reintentarse."], bullets: ["Caso normal", "Dato obligatorio vacío", "Registro duplicado", "Servicio temporalmente caído", "Persona sin permiso"] },
      { heading: "7. Deja dueño, alerta y revisión", paragraphs: ["Define quién recibe errores, dónde se revisa el historial y cada cuánto se comprueba el flujo. Las herramientas cambian; la automatización necesita un responsable aunque funcione sola."] },
    ],
    faq: [
      { question: "¿Qué tareas no conviene automatizar primero?", answer: "Decisiones legales, financieras o de personas; procesos inestables; tareas poco frecuentes; y flujos sin datos consistentes. Comienza por acciones reversibles y fáciles de comprobar." },
      { question: "¿Qué herramientas se pueden conectar?", answer: "Formularios, planillas, correo, CRM, gestores de tareas y mensajería suelen ofrecer integraciones directas o mediante plataformas como Make, Zapier o n8n." },
      { question: "¿Cómo sé si la automatización funciona?", answer: "Define una métrica: tiempo ahorrado, errores evitados, solicitudes procesadas o cumplimiento de plazo. Además, revisa el historial y configura alertas de fallo." },
    ],
  },
  {
    slug: "como-hacer-pitch-deck",
    title: "Cómo hacer un pitch deck que explique tu negocio sin humo",
    seoTitle: "Cómo hacer un pitch deck efectivo en 10 slides",
    description: "Estructura un pitch deck claro de diez slides para presentar tu problema, solución, mercado, evidencia y solicitud.",
    dek: "Una historia de negocio clara, diez slides útiles y una solicitud que la audiencia pueda entender.",
    category: "Presentaciones",
    readTime: "8 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-cool.webp",
    accent: "purple",
    serviceId: "pitch-deck",
    serviceTitle: "Pitch que prende",
    intro: ["Un pitch deck no es el plan de negocios completo. Es una historia breve que demuestra que existe un problema relevante, que tu solución tiene sentido y que tienes una ruta creíble para crecer.", "La audiencia debe poder repetir tu idea después de la reunión. Para lograrlo, el deck necesita menos texto, evidencia específica y una solicitud clara."],
    takeaways: ["Problema y solución entendibles", "Evidencia antes que adjetivos", "Una solicitud concreta"],
    sections: [
      { heading: "1. Resume el negocio en una frase", paragraphs: ["Explica para quién es, qué problema resuelve y cuál es el cambio que produce. Evita definiciones basadas solo en tecnología o categorías abstractas."], tip: "Si la frase necesita un glosario, todavía no está lista." },
      { heading: "2. Abre con el problema", paragraphs: ["Muestra una situación reconocible y su costo. Usa datos o una experiencia específica. El objetivo es que la audiencia entienda por qué vale la pena resolverlo ahora."] },
      { heading: "3. Presenta la solución en uso", paragraphs: ["En vez de listar funciones, muestra cómo cambia el proceso para la persona. Una captura, flujo o ejemplo concreto suele explicar más que una lista de características."] },
      { heading: "4. Explica mercado y oportunidad", paragraphs: ["Define el segmento inicial y cómo calculaste la oportunidad. Separa el mercado total de la parte que realmente puedes atender en la primera etapa."], bullets: ["Cliente inicial", "Cantidad estimada", "Ticket o frecuencia", "Expansión posible"] },
      { heading: "5. Prueba que hay señales", paragraphs: ["Incluye ventas, uso, crecimiento, pilotos, retención, cartas de intención o aprendizajes. Si todavía no hay tracción, muestra evidencia del problema y experimentos realizados."], tip: "Una señal pequeña y verificable vale más que una proyección enorme sin fundamento." },
      { heading: "6. Haz entendible el modelo", paragraphs: ["Explica quién paga, por qué concepto, cuánto y con qué recurrencia. Señala las variables principales sin convertir la slide en una hoja de cálculo."] },
      { heading: "7. Muestra por qué este equipo", paragraphs: ["Conecta experiencia, acceso y capacidades con el problema. No pegues currículums completos: destaca la razón por la que este equipo tiene una ventaja real."] },
      { heading: "8. Cierra con la solicitud", paragraphs: ["Indica qué buscas, para qué se utilizará y qué hito permitirá alcanzar. Termina con un siguiente paso que pueda ocurrir después de la reunión."], bullets: ["Monto o tipo de alianza", "Uso de recursos", "Hito de 12 a 18 meses", "Siguiente conversación"] },
    ],
    faq: [
      { question: "¿Cuántas slides debe tener un pitch deck?", answer: "Entre 8 y 12 slides es una buena referencia. La estructura debe cubrir problema, solución, oportunidad, evidencia, modelo, equipo y solicitud sin repetir ideas." },
      { question: "¿Debo incluir proyecciones financieras?", answer: "Sí, cuando sean relevantes para la audiencia. Resume supuestos, ingresos, costos y necesidades de capital; deja el modelo detallado como anexo." },
      { question: "¿Conviene enviar el mismo deck que presento?", answer: "Puedes tener una versión para presentar y otra autoexplicativa. La primera apoya tu relato; la segunda necesita más contexto para leerse sin ti." },
    ],
  },
  {
    slug: "como-escribir-newsletter-mensual",
    title: "Cómo escribir un newsletter mensual que la gente quiera abrir",
    seoTitle: "Cómo hacer un newsletter mensual: guía y estructura",
    description: "Planifica, redacta y diseña un newsletter mensual claro, útil y consistente para equipos, comunidades o marcas.",
    dek: "Menos comunicado corporativo. Más información útil, una voz reconocible y una próxima acción clara.",
    category: "Documentos",
    readTime: "7 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-point.webp",
    accent: "lime",
    serviceId: "newsletter-mensual",
    serviceTitle: "Newsletter mensual",
    intro: ["Un newsletter funciona cuando la persona sabe qué recibirá y por qué vale la pena abrirlo. La consistencia editorial importa más que llenar cada edición con todas las novedades.", "Define una promesa, una estructura repetible y una voz. Luego selecciona solo los contenidos que ayudan a cumplir esa promesa."],
    takeaways: ["Una promesa editorial reconocible", "Secciones repetibles", "Asunto y CTA específicos"],
    sections: [
      { heading: "1. Define para quién y para qué existe", paragraphs: ["Especifica la audiencia y el cambio que buscas: informar, activar, enseñar, fidelizar o alinear. Un newsletter interno y uno comercial no deberían compartir la misma lógica."] },
      { heading: "2. Crea una estructura que puedas repetir", paragraphs: ["Trabaja con tres o cuatro módulos estables. La repetición ayuda a leer más rápido y reduce el esfuerzo de producir cada edición."], bullets: ["Apertura breve", "Tema principal", "Tres novedades o recursos", "Una acción recomendada", "Cierre personal"] },
      { heading: "3. Elige una idea principal", paragraphs: ["Cada edición necesita un centro. Si hay muchas noticias, agrúpalas bajo una idea o prioriza. Lo que no cabe puede esperar la siguiente edición."] },
      { heading: "4. Escribe un asunto específico", paragraphs: ["Promete algo que realmente aparece dentro. Evita asuntos genéricos como “Newsletter de agosto” y fórmulas exageradas que dañen la confianza."], bullets: ["Una pregunta relevante", "Un aprendizaje concreto", "Una novedad con contexto", "Una lista breve y útil"] },
      { heading: "5. Diseña para escanear", paragraphs: ["Usa párrafos cortos, subtítulos, enlaces claros y una sola jerarquía visual. Comprueba el correo en móvil y no escondas la información esencial dentro de una imagen."] },
      { heading: "6. Elige una acción principal", paragraphs: ["Decide qué debería hacer la persona: leer, responder, inscribirse, revisar un documento o compartir. Una edición puede contener varios enlaces, pero debería tener una acción dominante."] },
      { heading: "7. Aprende de aperturas y clics", paragraphs: ["Compara temas, asuntos, horarios y secciones. También mira respuestas, reenvíos y conversaciones generadas. No optimices solo para aperturas si el objetivo real es otro."], tip: "Documenta qué funcionó y empieza la siguiente edición desde ese aprendizaje." },
    ],
    faq: [
      { question: "¿Cuál es una buena frecuencia para un newsletter?", answer: "Mensual funciona para equipos y marcas que necesitan consistencia sin forzar contenido semanal. Lo importante es cumplir la frecuencia prometida." },
      { question: "¿Qué extensión debería tener?", answer: "Entre 400 y 900 palabras suele ser manejable. Prioriza la utilidad y ofrece enlaces para profundizar en lugar de copiar documentos completos." },
      { question: "¿HTML o PDF?", answer: "HTML es mejor para envío, lectura móvil y medición. Un PDF puede servir como archivo o versión interna, pero no debería reemplazar el cuerpo del correo." },
    ],
  },
  {
    slug: "como-crear-landing-page",
    title: "Cómo crear una landing page clara que convierta visitas en acciones",
    seoTitle: "Cómo crear una landing page efectiva paso a paso",
    description: "Guía para definir la propuesta, estructura, contenido y medición de una landing page enfocada en una sola acción.",
    dek: "Una página, una promesa y una acción. Todo lo demás debe ayudar a que la persona avance.",
    category: "Diseño",
    readTime: "8 min",
    updatedAt: "2026-08-16",
    art: "/brand/chispita-laptop.webp",
    accent: "lavender",
    serviceId: "landing-express",
    serviceTitle: "Landing express",
    intro: ["Una landing page no necesita contar toda la historia de una empresa. Necesita responder las preguntas de una persona específica y conducirla hacia una acción.", "Antes de diseñar, define la fuente de tráfico, la promesa y la conversión. Una página para anuncios necesita continuidad con la campaña; una página para un evento necesita resolver fecha, valor y registro."],
    takeaways: ["Una promesa visible arriba", "Pruebas cerca de las objeciones", "Un CTA repetido con sentido"],
    sections: [
      { heading: "1. Define una conversión principal", paragraphs: ["Elige una acción medible: agendar, comprar, registrarse, descargar o solicitar información. Evita dar el mismo peso a cinco caminos distintos."] },
      { heading: "2. Escribe la propuesta antes del diseño", paragraphs: ["Completa esta frase: ayudamos a [audiencia] a conseguir [resultado] mediante [solución o diferencia]. Luego tradúcela a un titular humano y específico."], tip: "El primer bloque debe entenderse sin hacer scroll y sin conocer previamente la marca." },
      { heading: "3. Ordena la página por preguntas", paragraphs: ["Construye la secuencia según lo que la persona necesita saber para avanzar."], bullets: ["¿Qué es y para quién?", "¿Qué resultado ofrece?", "¿Cómo funciona?", "¿Por qué confiar?", "¿Qué incluye o cuesta?", "¿Qué hago ahora?"] },
      { heading: "4. Reduce fricción en el formulario", paragraphs: ["Pide solo la información necesaria para el siguiente paso. Explica qué ocurrirá después y cuánto demora una respuesta. Los formularios largos convierten menos y generan datos de peor calidad."] },
      { heading: "5. Usa evidencia específica", paragraphs: ["Incluye resultados, testimonios, clientes, demostraciones o una explicación concreta del proceso. Evita logos sin contexto y frases imposibles de comprobar."] },
      { heading: "6. Diseña una jerarquía móvil", paragraphs: ["Revisa tamaño de texto, contraste, espaciado y botones con el teléfono. Mantén el CTA accesible y evita imágenes pesadas que retrasen la carga."] },
      { heading: "7. Mide el recorrido completo", paragraphs: ["Configura eventos para visitas, clics, inicios de formulario y envíos. Conecta la conversión con la campaña y revisa calidad, no solo volumen."], bullets: ["Tasa de conversión", "Costo por acción", "Abandono de formulario", "Calidad del lead", "Velocidad de carga"] },
    ],
    faq: [
      { question: "¿Cuántas secciones necesita una landing page?", answer: "Entre cuatro y siete suele ser suficiente. La extensión depende de la complejidad y del nivel de confianza que la persona necesita antes de actuar." },
      { question: "¿Debo mostrar el precio?", answer: "Si el precio es fijo o ayuda a calificar, mostrarlo reduce incertidumbre. Si depende de variables, explica qué lo determina y ofrece un siguiente paso claro." },
      { question: "¿Qué hace que una landing cargue rápido?", answer: "Imágenes optimizadas, pocas dependencias, fuentes controladas, video diferido y una implementación responsive. La velocidad forma parte de la experiencia de conversión." },
    ],
  },
];

export function getChispiRead(slug: string | undefined) {
  return chispireads.find((article) => article.slug === slug);
}
