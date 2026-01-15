import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Buscando curso de Inteligencia Artificial...");

  // Buscar el curso por título aproximado
  const course = await prisma.course.findFirst({
    where: {
      title: {
        contains: "Inteligencia Artificial",
        mode: "insensitive",
      },
    },
  });

  if (!course) {
    console.error("No se encontró el curso de Inteligencia Artificial.");
    return;
  }

  console.log(`Curso encontrado: ${course.title} (${course.id})`);

  // Crear el nuevo módulo
  const moduleTitle = "Técnicas Avanzadas y Herramientas";
  console.log(`Creando módulo: ${moduleTitle}...`);

  // Obtener el último orden de módulos para añadir al final
  const lastModule = await prisma.module.findFirst({
    where: { courseId: course.id },
    orderBy: { order: "desc" },
  });

  const newOrder = (lastModule?.order || 0) + 1;

  const newModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: moduleTitle,
      description: "Preguntas frecuentes, casos de uso prácticos y herramientas especializadas.",
      order: newOrder,
    },
  });

  console.log(`Módulo creado: ${newModule.id}`);

  // Lección 1: Estrategias de Texto y Gestión
  const lesson1Title = "Estrategias de Texto y Gestión";
  const lesson1Content = `
**P: ¿Para qué tipo de tareas es Gemini la mejor opción?**
R: Es ideal para tareas que requieren información actualizada en tiempo real (noticias, precios, tendencias) y para una integración fluida con el ecosistema de Google Workspace.

**P: Estás trabajando en una conversación muy larga y la IA empieza a cometer errores tontos o ignora instrucciones. ¿Qué está pasando y qué debes hacer?**
R: La ventana de contexto se llenó y la IA está "olvidando" el inicio. La solución es abrir un nuevo chat y empezar de cero con un resumen limpio de lo trabajado hasta el momento.

**P: ¿Qué elementos debe tener tu prompt para que la IA redacte un correo de cobranza útil y profesional?**
R: Debe incluir un rol (ej: gestor de cuentas), la tarea exacta, límites claros (tono amable, sin amenazas, máximo 100 palabras) y el formato de entrega (asunto y cuerpo del mail).

**P: Si la IA entrega un texto con palabras robóticas como "sinergia" o "disruptivo", ¿cómo lo corriges rápidamente?**
R: Pidiéndole que corrija el texto anterior eliminando esas palabras, usando un lenguaje más natural y prohibiéndole específicamente el uso de clichés corporativos.

**P: ¿Cómo le explicas a la IA que quieres clasificar comentarios de clientes en una tabla con un formato muy específico?**
R: Mostrándole ejemplos concretos (2 o 3 casos) de comentarios ya clasificados con el formato exacto que deseas obtener.

**P: ¿Cómo pedirías a la IA explicar un concepto técnico a tu jefe (experto) y a un cliente (novato)?**
R: Pidiéndole que cambie de perspectiva: para el jefe, que actúe como consultor experto con datos clave; para el cliente, que actúe como profesor con ejemplos simples.

**P: ¿Qué debes hacer antes de incluir estadísticas de ventas entregadas por la IA en un reporte?**
R: Verificar que los datos sean reales consultando fuentes oficiales o pidiéndole el enlace de la fuente, ya que la IA puede inventar cifras (alucinar).

**P: ¿Cómo pedirías a la IA convertir notas sueltas de una reunión en un reporte formal?**
R: Entregando las notas en bullet points y pidiéndole que las expanda en un reporte estructurado, especificando el formato final deseado.

**P: ¿Cómo usas la IA para resumir un hilo de 15 correos confusos donde te copiaron?**
R: Copiando todo el hilo en la IA y solicitando un resumen que identifique el problema original, puntos de conflicto, decisión final y tus tareas pendientes.
  `.trim();

  await prisma.lesson.create({
    data: {
      moduleId: newModule.id,
      title: lesson1Title,
      content: lesson1Content,
      order: 1,
    },
  });
  console.log(`Lección creada: ${lesson1Title}`);

  // Lección 2: Herramientas Especializadas y Agentes
  const lesson2Title = "Herramientas Especializadas y Agentes";
  const lesson2Content = `
**P: ¿Cuál es la diferencia entre pedirle a una IA que traduzca un texto versus que lo "localice"?**
R: Traducir es cambiar palabras de un idioma a otro; localizar es adaptar expresiones, modismos y referencias culturales para que el mensaje sea natural para un público específico.

**P: ¿Para qué sirve DeepL y en qué es superior a ChatGPT para traducciones empresariales?**
R: Es superior en traducciones técnicas y legales, permite mantener el formato original de documentos completos y ofrece un glosario para garantizar coherencia terminológica corporativa.

**P: ¿Qué hace diferente a Microsoft Copilot en Word comparado con usar ChatGPT por separado?**
R: Copilot está integrado directamente en Word, tiene acceso al contenido de tu documento actual y puede transformar o generar borradores formateados al instante.

**P: ¿Cómo usarías la IA para crear una imagen profesional si no sabes de diseño?**
R: Usando ChatGPT o Claude para generar un prompt técnico detallado en inglés (iluminación, estilo, texturas) y luego pegando ese prompt en herramientas como Midjourney o DALL-E.

**P: ¿Cuándo usarías Midjourney y cuándo usarías DALL-E 3 para generar imágenes?**
R: Midjourney para alta calidad estética e hiperrealismo; DALL-E 3 para composiciones complejas con múltiples elementos interactuando, ya que entiende mejor el lenguaje natural.

**P: ¿Cuál es la mejor herramienta para crear videos con IA actualmente y por qué?**
R: Google Veo es la mejor opción actualmente por su alta fidelidad y capacidades avanzadas de generación.

**P: ¿Cómo crearías el prompt perfecto para un video profesional usando IA?**
R: Usando a Gemini o ChatGPT como asistente para redactar un prompt en inglés que incluya detalles de iluminación, texturas y movimientos de cámara, para luego llevarlo a Google Veo.

**P: ¿Para qué sirve ElevenLabs y cómo lo usarías en tu trabajo?**
R: Sirve para generar voces naturales con IA. Se usa para convertir manuales en audio, crear locuciones para videos o generar mensajes de voz profesionales.

**P: ¿Cómo usarías la IA para revisar rápidamente un PDF de 50 páginas?**
R: Subiendo el archivo a la IA y haciendo preguntas específicas sobre áreas críticas o impactos en departamentos específicos, en lugar de pedir un resumen general.

**P: ¿Cómo extraes datos de una foto de una factura física a formato digital usando IA?**
R: Subiendo la foto a la IA y pidiéndole específicamente: "Extrae estos datos y dámelos en formato de tabla con estas columnas: [nombres de columnas]".

**P: ¿Cuál es la diferencia entre un chat normal de IA y un agente de IA?**
R: Un chat es un asistente pasivo que responde preguntas; un agente es un asistente activo que ejecuta procesos de varios pasos para completar una misión.

**P: ¿Cuáles son los 5 componentes esenciales de un agente de IA bien configurado?**
R: Objetivo (misión), Instrucciones (comportamiento), Herramientas (acceso a apps), Contexto/Memoria y Límites (qué no hacer).

**P: Menciona tareas donde NO deberías dejar que un agente de IA trabaje completamente solo.**
R: Decisiones éticas sobre personas, movimientos de dinero, manejo de información confidencial extrema o envío de comunicaciones oficiales sin revisión humana.
  `.trim();

  await prisma.lesson.create({
    data: {
      moduleId: newModule.id,
      title: lesson2Title,
      content: lesson2Content,
      order: 2,
    },
  });
  console.log(`Lección creada: ${lesson2Title}`);

  console.log("¡Contenido agregado exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
