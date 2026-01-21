
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting simulation script...");

  // 1. Get official CONTRACT_ADMIN
  const adminEmail = "admin@empresa.com";
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { companies: true }
  });

  if (!admin) {
    console.log("⚠️ Official admin not found, creating baseline...");
    const hashedAdminPassword = await bcrypt.hash("password123", 10);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin Empresa S.A.",
        password: hashedAdminPassword,
        role: "CONTRACT_ADMIN",
      },
      include: { companies: true }
    });
  }
  console.log(`👤 Contract Admin ready: ${admin.email}`);

  // 2. Ensure Company exists and is linked
  let company = admin.companies[0];
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Empresa Cliente S.A.",
        users: { connect: { id: admin.id } }
      }
    });
  }
  console.log(`🏢 Company ready: ${company.name}`);

  // 3. Ensure a Contract exists for this admin
  const contract = await prisma.contract.upsert({
    where: { id: "test-contract-1" },
    update: { adminId: admin.id, companyId: company.id, status: "ACTIVE" },
    create: {
      id: "test-contract-1",
      companyId: company.id,
      adminId: admin.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      status: "ACTIVE",
      maxUsers: 20
    }
  });
  console.log(`📄 Contract ready: ${contract.id}`);

  // 4. Ensure Course exists
  const course = await prisma.course.upsert({
    where: { id: "test-course-1" },
    update: {
      status: "PUBLISHED",
      contracts: { connect: { id: contract.id } }
    },
    create: {
      id: "test-course-1",
      title: "Ciberseguridad Pro",
      description: "Curso avanzado de seguridad informática corporativa.",
      status: "PUBLISHED",
      creatorId: admin.id,
      contracts: { connect: { id: contract.id } }
    },
  });

  const evaluation = await prisma.finalEvaluation.upsert({
    where: { courseId: course.id },
    update: {},
    create: {
      courseId: course.id,
      passingScore: 70,
      questions: [
        {
          text: "¿Qué es el phishing?",
          idealAnswer: "Es un método para engañar a usuarios y obtener información confidencial.",
          weight: 50
        },
        {
          text: "Defina MFA.",
          idealAnswer: "Autenticación de múltiples factores para añadir capas de seguridad.",
          weight: 50
        }
      ]
    },
  });

  console.log(`📚 Course ready: ${course.title}`);

  // 5. Create 5 Employees
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
      update: {
        contracts: { connect: { id: contract.id } },
        companies: { connect: { id: company.id } }
      },
      create: {
        email: emp.email,
        name: emp.name,
        password: hashedPassword,
        role: "EMPLOYEE",
        companies: { connect: { id: company.id } },
        contracts: { connect: { id: contract.id } }
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

    // 6. Simulate Evaluation Attempt
    const flaggedCount = emp.flags.filter(f => f).length;
    const prob = Math.round((flaggedCount / 2) * 100);

    await prisma.evaluationAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        evaluationId: evaluation.id,
        score: emp.score,
        passed: emp.passed,
        answers: {
          rawAnswers: [
            "Respuesta elaborada sobre phishing.",
            "Conceptos sobre MFA."
          ],
          grading: {
            overallFeedback: emp.passed ? "Excelente." : "Necesita mejorar.",
            overallScore: emp.score,
            questionResults: [
              {
                questionIndex: 0,
                score: emp.score,
                feedback: "Bien.",
                suspectedAI: emp.flags[0],
                aiSuspicionReason: emp.flags[0] ? "Patrón detectado." : null
              },
              {
                questionIndex: 1,
                score: emp.score,
                feedback: "Correcto.",
                suspectedAI: emp.flags[1],
                aiSuspicionReason: emp.flags[1] ? "Patrón detectado." : null
              }
            ]
          }
        },
        aiScore: emp.aiGrade,
        aiReasoning: prob > 0 ? "Sospecha de uso de IA." : "Sin rastro de IA."
      }
    });

    console.log(`✅ Simulated: ${emp.email} (Grade: ${emp.score}, Prob IA: ${prob}%)`);
  }

  console.log("\n✨ Simulation finished successfully!");
  console.log(`Usa el correo: admin@empresa.com / password123 para ver el dashboard.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
