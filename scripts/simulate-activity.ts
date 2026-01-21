import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting simulation script...");

  // 1. Create or Find Company
  const company = await prisma.company.upsert({
    where: { id: "test-company-id" },
    update: {},
    create: {
      id: "test-company-id",
      name: "Empresa de Prueba S.A.",
    },
  });
  console.log(`🏢 Company ready: ${company.name}`);

  // 2. Create Client Admin
  const hashedAdminPassword = await bcrypt.hash("password123", 10);
  const clientAdmin = await prisma.user.upsert({
    where: { email: "admin@pruebas.com" },
    update: {},
    create: {
      email: "admin@pruebas.com",
      name: "Admin de Prueba",
      password: hashedAdminPassword,
      role: "CLIENT",
      companies: { connect: { id: company.id } },
    },
  });
  console.log(`👤 Client Admin ready: ${clientAdmin.email}`);

  // 3. Create a Course and Final Evaluation if it doesn't exist
  // We'll try to find an existing course first to avoid cluttering
  let course = await prisma.course.findFirst({
    where: { status: "PUBLISHED" }
  });

  if (!course) {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) throw new Error("Need at least one ADMIN user to create a course");

    course = await prisma.course.create({
      data: {
        title: "Curso de Ciberseguridad Corporativa",
        description: "Fundamentos de seguridad para empleados.",
        status: "PUBLISHED",
        creatorId: adminUser.id,
        companyId: company.id,
        finalEvaluation: {
          create: {
            questions: [
              { id: "q1", text: "¿Qué es el phishing?", idealAnswer: "Un ataque de ingeniería social..." },
              { id: "q2", text: "Defina MFA.", idealAnswer: "Autenticación de múltiples factores..." }
            ],
            passingScore: 70
          }
        }
      }
    });
  } else {
    // Ensure it has a final evaluation
    const evaluation = await prisma.finalEvaluation.upsert({
      where: { courseId: course.id },
      update: {},
      create: {
        courseId: course.id,
        questions: [
          { id: "q1", text: "Pregunta Abierta 1", idealAnswer: "Respuesta ideal 1" },
          { id: "q2", text: "Pregunta Abierta 2", idealAnswer: "Respuesta ideal 2" }
        ],
        passingScore: 75
      }
    });
    // Link course to company if it's not already
    await prisma.course.update({
      where: { id: course.id },
      data: { companyId: company.id }
    });
  }

  const evaluation = await prisma.finalEvaluation.findUnique({ where: { courseId: course.id } });
  if (!evaluation) throw new Error("Evaluation failed to create/find");

  console.log(`📚 Course ready: ${course.title}`);

  // 4. Create 5 Employees with varied profiles
  const employeeData = [
    { name: "Juan (IA Detective)", email: "juan.ia@pruebas.com", score: 98, aiGrade: 100, passed: true, flags: [true, true] },
    { name: "Maria (Honesta)", email: "maria.honest@pruebas.com", score: 85, aiGrade: 88, passed: true, flags: [false, false] },
    { name: "Roberto (Dudoso)", email: "roberto@pruebas.com", score: 72, aiGrade: 75, passed: true, flags: [true, false] },
    { name: "Sofía (Nivel Bajo)", email: "sofia@pruebas.com", score: 45, aiGrade: 42, passed: false, flags: [false, false] },
    { name: "Carlos (Copia Parcial)", email: "carlos@pruebas.com", score: 88, aiGrade: 92, passed: true, flags: [false, true] },
  ];

  const hashedPassword = await bcrypt.hash("password123", 10);

  for (const emp of employeeData) {
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        name: emp.name,
        password: hashedPassword,
        role: "EMPLOYEE",
        companies: { connect: { id: company.id } },
      },
    });

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: {
        status: emp.passed ? "COMPLETED" : "IN_PROGRESS",
        completedAt: emp.passed ? new Date() : null,
      },
      create: {
        userId: user.id,
        courseId: course.id,
        companyId: company.id,
        status: emp.passed ? "COMPLETED" : "IN_PROGRESS",
        completedAt: emp.passed ? new Date() : null,
      },
    });

    // Determine flag count
    const flaggedCount = emp.flags.filter(f => f).length;
    const prob = Math.round((flaggedCount / 2) * 100);

    // 6. Simulate Evaluation Attempt with AI Feedback
    await prisma.evaluationAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        evaluationId: evaluation.id,
        score: emp.score,
        passed: emp.passed,
        answers: {
          rawAnswers: [
            "Respuesta elaborada sobre el tema solicitado en la pregunta 1.",
            "Conceptos técnicos aplicados a la respuesta de la pregunta 2."
          ],
          grading: {
            overallFeedback: emp.passed
              ? `El estudiante demuestra un dominio del ${emp.score}% de los temas.`
              : "Se requiere un refuerzo inmediato en los fundamentos.",
            overallScore: emp.score,
            questionResults: [
              {
                questionIndex: 0,
                score: emp.score + (emp.flags[0] ? 2 : -2),
                feedback: emp.flags[0] ? "Respuesta extremadamente estructurada." : "Respuesta natural y correcta.",
                suspectedAI: emp.flags[0],
                aiSuspicionReason: emp.flags[0] ? "Patrón de escritura predictivo detectado." : null
              },
              {
                questionIndex: 1,
                score: emp.score + (emp.flags[1] ? 2 : -2),
                feedback: emp.flags[1] ? "Uso de vocabulario ultra-técnico inusual." : "Buen razonamiento.",
                suspectedAI: emp.flags[1],
                aiSuspicionReason: emp.flags[1] ? "Indicadores de lenguaje LLM detectados." : null
              }
            ]
          }
        },
        aiScore: emp.aiGrade,
        aiReasoning: prob > 50
          ? "Se detectaron indicadores críticos de uso de IA en la mayoría de las respuestas."
          : prob > 0
            ? "Existen sospechas parciales en algunas respuestas, se recomienda revisión."
            : "No se detectaron patrones de IA conocidos.",
      },
    });

    console.log(`✅ Activity simulated for: ${emp.email} (Grade: ${emp.score}, Prob IA: ${prob}%)`);
  }


  console.log("\n✨ Simulation finished successfully!");
  console.log(`Usa el correo: admin@pruebas.com / password123 para ver el dashboard.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
