import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Buscando curso de Inteligencia Artificial...");

  const course = await prisma.course.findFirst({
    where: {
      title: {
        contains: "Inteligencia Artificial",
        mode: "insensitive",
      },
    },
    include: {
      finalEvaluation: true,
      modules: {
        where: {
          title: "Técnicas Avanzadas y Herramientas"
        }
      }
    }
  });

  if (!course) {
    console.error("No se encontró el curso de Inteligencia Artificial.");
    return;
  }

  console.log(`Curso encontrado: ${course.title} (${course.id})`);

  // 1. Eliminar el módulo creado anteriormente si existe
  if (course.modules.length > 0) {
    const moduleToDelete = course.modules[0];
    console.log(`Eliminando módulo antiguo: ${moduleToDelete.title} (${moduleToDelete.id})`);

    // Prisma borra en cascada si está configurado, pero por seguridad borramos lecciones primero si es necesario
    // Asumiendo onDelete: Cascade en schema (lo verificamos en view_file anterior y sí estaba)
    await prisma.module.delete({
      where: { id: moduleToDelete.id }
    });
    console.log("Módulo eliminado.");
  } else {
    console.log("No se encontró el módulo 'Técnicas Avanzadas y Herramientas', tal vez ya fue borrado.");
  }

  // 2. Preparar las preguntas para la evaluación final
  const questions = [
    {
      question: "¿Para qué tipo de tareas es Gemini la mejor opción?",
      idealAnswer: "Es ideal para tareas que requieren información actualizada en tiempo real (noticias, precios, tendencias) y para una integración fluida con el ecosistema de Google Workspace."
    },
    {
      question: "Estás trabajando en una conversación muy larga y la IA empieza a cometer errores tontos o ignora instrucciones. ¿Qué está pasando y qué debes hacer?",
      idealAnswer: "La ventana de contexto se llenó y la IA está 'olvidando' el inicio. La solución es abrir un nuevo chat y empezar de cero con un resumen limpio de lo trabajado hasta el momento."
    },
    {
      question: "¿Qué elementos debe tener tu prompt para que la IA redacte un correo de cobranza útil y profesional?",
      idealAnswer: "Debe incluir un rol (ej: gestor de cuentas), la tarea exacta, límites claros (tono amable, sin amenazas, máximo 100 palabras) y el formato de entrega (asunto y cuerpo del mail)."
    },
    {
      question: "Si la IA entrega un texto con palabras robóticas como 'sinergia' o 'disruptivo', ¿cómo lo corriges rápidamente?",
      idealAnswer: "Pidiéndole que corrija el texto anterior eliminando esas palabras, usando un lenguaje más natural y prohibiéndole específicamente el uso de clichés corporativos."
    },
    {
      question: "¿Cómo le explicas a la IA que quieres clasificar comentarios de clientes en una tabla con un formato muy específico?",
      idealAnswer: "Mostrándole ejemplos concretos (2 o 3 casos) de comentarios ya clasificados con el formato exacto que deseas obtener."
    },
    {
      question: "¿Cómo pedirías a la IA explicar un concepto técnico a tu jefe (experto) y a un cliente (novato)?",
      idealAnswer: "Pidiéndole que cambie de perspectiva: para el jefe, que actúe como consultor experto con datos clave; para el cliente, que actúe como profesor con ejemplos simples."
    },
    {
      question: "¿Qué debes hacer antes de incluir estadísticas de ventas entregadas por la IA en un reporte?",
      idealAnswer: "Verificar que los datos sean reales consultando fuentes oficiales o pidiéndole el enlace de la fuente, ya que la IA puede inventar cifras (alucinar)."
    },
    {
      question: "¿Cómo pedirías a la IA convertir notas sueltas de una reunión en un reporte formal?",
      idealAnswer: "Entregando las notas en bullet points y pidiéndole que las expanda en un reporte estructurado, especificando el formato final deseado."
    },
    {
      question: "¿Cómo usas la IA para resumir un hilo de 15 correos confusos donde te copiaron?",
      idealAnswer: "Copiando todo el hilo en la IA y solicitando un resumen que identifique el problema original, puntos de conflicto, decisión final y tus tareas pendientes."
    },
    {
      question: "¿Cuál es la diferencia entre pedirle a una IA que traduzca un texto versus que lo 'localice'?",
      idealAnswer: "Traducir es cambiar palabras de un idioma a otro; localizar es adaptar expresiones, modismos y referencias culturales para que el mensaje sea natural para un público específico."
    },
    {
      question: "¿Para qué sirve DeepL y en qué es superior a ChatGPT para traducciones empresariales?",
      idealAnswer: "Es superior en traducciones técnicas y legales, permite mantener el formato original de documentos completos y ofrece un glosario para garantizar coherencia terminológica corporativa."
    },
    {
      question: "¿Qué hace diferente a Microsoft Copilot en Word comparado con usar ChatGPT por separado?",
      idealAnswer: "Copilot está integrado directamente en Word, tiene acceso al contenido de tu documento actual y puede transformar o generar borradores formateados al instante."
    },
    {
      question: "¿Cómo usarías la IA para crear una imagen profesional si no sabes de diseño?",
      idealAnswer: "Usando ChatGPT o Claude para generar un prompt técnico detallado en inglés (iluminación, estilo, texturas) y luego pegando ese prompt en herramientas como Midjourney o DALL-E."
    },
    {
      question: "¿Cuándo usarías Midjourney y cuándo usarías DALL-E 3 para generar imágenes?",
      idealAnswer: "Midjourney para alta calidad estética e hiperrealismo; DALL-E 3 para composiciones complejas con múltiples elementos interactuando, ya que entiende mejor el lenguaje natural."
    },
    {
      question: "¿Cuál es la mejor herramienta para crear videos con IA actualmente y por qué?",
      idealAnswer: "Google Veo es la mejor opción actualmente por su alta fidelidad y capacidades avanzadas de generación."
    },
    {
      question: "¿Cómo crearías el prompt perfecto para un video profesional usando IA?",
      idealAnswer: "Usando a Gemini o ChatGPT como asistente para redactar un prompt en inglés que incluya detalles de iluminación, texturas y movimientos de cámara, para luego llevarlo a Google Veo."
    },
    {
      question: "¿Para qué sirve ElevenLabs y cómo lo usarías en tu trabajo?",
      idealAnswer: "Sirve para generar voces naturales con IA. Se usa para convertir manuales en audio, crear locuciones para videos o generar mensajes de voz profesionales."
    },
    {
      question: "¿Cómo usarías la IA para revisar rápidamente un PDF de 50 páginas?",
      idealAnswer: "Subiendo el archivo a la IA y haciendo preguntas específicas sobre áreas críticas o impactos en departamentos específicos, en lugar de pedir un resumen general."
    },
    {
      question: "¿Cómo extraes datos de una foto de una factura física a formato digital usando IA?",
      idealAnswer: "Subiendo la foto a la IA y pidiéndole específicamente: 'Extrae estos datos y dámelos en formato de tabla con estas columnas: [nombres de columnas]'."
    },
    {
      question: "¿Cuál es la diferencia entre un chat normal de IA y un agente de IA?",
      idealAnswer: "Un chat es un asistente pasivo que responde preguntas; un agente es un asistente activo que ejecuta procesos de varios pasos para completar una misión."
    },
    {
      question: "¿Cuáles son los 5 componentes esenciales de un agente de IA bien configurado?",
      idealAnswer: "Objetivo (misión), Instrucciones (comportamiento), Herramientas (acceso a apps), Contexto/Memoria y Límites (qué no hacer)."
    },
    {
      question: "Menciona tareas donde NO deberías dejar que un agente de IA trabaje completamente solo.",
      idealAnswer: "Decisiones éticas sobre personas, movimientos de dinero, manejo de información confidencial extrema o envío de comunicaciones oficiales sin revisión humana."
    }
  ];

  // 3. Upsert evaluación final
  console.log("Actualizando/Creando Evaluación Final...");

  await prisma.finalEvaluation.upsert({
    where: {
      courseId: course.id
    },
    create: {
      courseId: course.id,
      questions: questions,
      passingScore: 70
    },
    update: {
      questions: questions
    }
  });

  console.log(`Evaluación final actualizada con ${questions.length} preguntas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
