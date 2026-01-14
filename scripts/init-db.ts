/**
 * Script de inicialización de base de datos
 * Ejecutar con: npx tsx scripts/init-db.ts
 * 
 * Este script crea un usuario administrador inicial
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Inicializando base de datos...");

  // Crear usuario administrador
  const adminEmail = "admin@cursia.com";
  const adminPassword = "admin123"; // Cambiar en producción

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  console.log("Usuario administrador creado:", admin.email);
  console.log("Contraseña temporal:", adminPassword);
  console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión");

  // Crear Curso de IA
  console.log("\nCreando curso de Inteligencia Artificial...");

  const aiCourse = await prisma.course.create({
    data: {
      title: "Curso Completo de Inteligencia Artificial",
      description: "Domina los fundamentos, técnicas y aplicaciones de la IA moderna. Desde Machine Learning hasta IA Generativa.",
      status: "PUBLISHED",
      creatorId: admin.id,
      publishedAt: new Date(),
      modules: {
        create: [
          {
            title: "Fundamentos de IA",
            description: "Introducción a la historia y conceptos básicos.",
            order: 1,
            lessons: {
              create: [
                {
                  title: "¿Qué es la Inteligencia Artificial?",
                  content: "La Inteligencia Artificial (IA) es la simulación de procesos de inteligencia humana por parte de sistemas informáticos. Estos procesos incluyen el aprendizaje, el razonamiento y la autocorrección.",
                  order: 1,
                  videoUrl: "https://www.youtube.com/watch?v=2ePf9rue1Ao", // Dummy URL
                },
                {
                  title: "Historia de la IA",
                  content: "Desde los primeros conceptos de Alan Turing hasta los modelos modernos de Deep Learning. Un recorrido por los hitos más importantes.",
                  order: 2,
                },
                {
                  title: "Tipos de IA: ANI, AGI, ASI",
                  content: "Diferencias entre Inteligencia Artificial Estrecha (ANI), General (AGI) y Superinteligencia (ASI).",
                  order: 3,
                }
              ]
            }
          },
          {
            title: "Machine Learning",
            description: "El motor detrás de la IA moderna.",
            order: 2,
            lessons: {
              create: [
                {
                  title: "Aprendizaje Supervisado",
                  content: "Entrenamiento de modelos con datos etiquetados. Ejemplos: clasificación de correos spam, predicción de precios.",
                  order: 1,
                },
                {
                  title: "Aprendizaje No Supervisado",
                  content: "Descubriendo patrones en datos no etiquetados. Clustering y reducción de dimensionalidad.",
                  order: 2,
                },
                {
                  title: "Aprendizaje por Refuerzo",
                  content: "Cómo los agentes aprenden a tomar decisiones a través de prueba y error en un entorno interactivo.",
                  order: 3,
                }
              ]
            }
          },
          {
            title: "Deep Learning",
            description: "Redes neuronales y computación profunda.",
            order: 3,
            lessons: {
              create: [
                {
                  title: "Redes Neuronales Artificiales",
                  content: "Inspiradas en el cerebro humano, estas redes son la base del Deep Learning.",
                  order: 1,
                },
                {
                  title: "Redes Convolucionales (CNN)",
                  content: "Especializadas en el procesamiento de imágenes y visión por computadora.",
                  order: 2,
                },
                {
                  title: "Redes Recurrentes (RNN) y Transformers",
                  content: "Procesamiento de secuencias y lenguaje natural. La arquitectura detrás de GPT.",
                  order: 3,
                }
              ]
            }
          },
          {
            title: "IA Generativa",
            description: "Creación de contenido nuevo con IA.",
            order: 4,
            lessons: {
              create: [
                {
                  title: "Modelos de Lenguaje (LLMs)",
                  content: "Cómo funcionan modelos como GPT-4, Claude y Llama. Tokenización y atención.",
                  order: 1,
                },
                {
                  title: "Generación de Imágenes",
                  content: "Modelos de difusión como Stable Diffusion y Midjourney.",
                  order: 2,
                },
                {
                  title: "Prompt Engineering",
                  content: "El arte de comunicarse efectivamente con los modelos de IA para obtener los mejores resultados.",
                  order: 3,
                }
              ]
            }
          },
          {
            title: "Ética y Futuro",
            description: "Impacto social y consideraciones éticas.",
            order: 5,
            lessons: {
              create: [
                {
                  title: "Sesgo y Equidad",
                  content: "Cómo los datos sesgados pueden llevar a modelos discriminatorios y cómo mitigarlo.",
                  order: 1,
                },
                {
                  title: "IA y el Mercado Laboral",
                  content: "Automatización, desplazamiento de empleos y nuevas oportunidades.",
                  order: 2,
                },
                {
                  title: "Regulación y Seguridad",
                  content: "La necesidad de marcos legales y medidas de seguridad para el desarrollo responsable de la IA.",
                  order: 3,
                }
              ]
            }
          }
        ]
      }
    }
  });

  console.log(`Curso creado: ${aiCourse.title} (${aiCourse.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

