/**
 * Seed script — Ejemplo 1
 * Crea 5 empleados, los enrolla en el curso activo y simula progreso variado.
 * SOLO INSERT — nunca borra ni modifica registros existentes.
 */
const { PrismaClient } = require("../node_modules/@prisma/client");
const bcrypt = require("../node_modules/bcryptjs");

const prisma = new PrismaClient();

const COMPANY_ID  = "cmkfqdlaq00002172i3zn32yy";
const CONTRACT_ID = "cmkfqe9ri00022172i0ulq4ba";
const COURSE_ID   = "cmkdc9n8f0002sffsiya6qcfc";

// Módulos y lecciones del curso (en orden)
const MODULES = [
  {
    id: "cmkdc9n8f0003sffs3r8281g2",
    lessons: [
      "cmke7lbma0005atij6u7gj8lt",
      "cmkdc9n8f0004sffscut1j00z",
      "cmkdc9n8f0005sffs007d5wl7",
    ],
  },
  {
    id: "cmkdc9n8f0007sffskv4w7414",
    lessons: [
      "cmkdc9n8f0009sffs7lxhkr7o",
      "cmkdc9n8f0008sffsye38fqxc",
      "cmke7r8y7000batij3ia3uqlp",
      "cmkdc9n8f000asffst3r2bned",
    ],
  },
  {
    id: "cmkdc9n8f000bsffsi16g8uf1",
    lessons: [
      "cmke7wqi3000fatijj6wrdzxc",
      "cmke7vzuk000datijoglgioml",
      "cmkdc9n8f000dsffsn81b3ozb",
      "cmkdc9n8f000csffschaz7apv",
    ],
  },
  {
    id: "cmkdc9n8f000fsffsrqhf0fn3",
    lessons: [
      "cmkdc9n8f000gsffsmexbs9cd",
      "cmkdc9n8f000hsffslkrc9q69",
      "cmkdc9n8g000isffs7t4vgbjk",
      "cmke883w3000latijgko8eb4m",
    ],
  },
  {
    id: "cmkdc9n8g000jsffspkblvnik",
    lessons: [
      "cmkdc9n8g000lsffstjgqpdt2",
      "cmkdc9n8g000ksffs6q1diohh",
      "cmkdc9n8g000msffsrskp6xkt",
      "cmke8av9w0003yvxn81h2usj0",
    ],
  },
  {
    id: "cmke8muj8000byvxn9ttkpgpr",
    lessons: [
      "cmke8mxpc000fyvxnnr7ca3p0",
      "cmke8mww1000dyvxnm1eyfkh3",
      "cmke8myd6000hyvxncqi60muu",
    ],
  },
  {
    id: "cmke8u5pq00013599fsi09peq",
    lessons: [
      "cmke8u9dy000735990h8hh7dp",
      "cmke8ua2600093599q4qrtmuj",
      "cmke8u8d2000535996yd41mxu",
      "cmke8u7ii000335991oxhbo80",
    ],
  },
];

// 5 empleados con distinto nivel de avance (modulesCompleted = módulos completos, lessonsInNext = lecciones completadas del siguiente módulo)
const EMPLOYEES = [
  { name: "Paola Gómez",       email: "paola.gomez@ejemplo1.co",    modulesCompleted: 6, lessonsInNext: 3 }, // ~92%
  { name: "Camila Herrera",    email: "camila.herrera@ejemplo1.co", modulesCompleted: 4, lessonsInNext: 2 }, // ~65%
  { name: "Andrés Morales",    email: "andres.morales@ejemplo1.co", modulesCompleted: 3, lessonsInNext: 1 }, // ~48%
  { name: "Daniela Ospina",    email: "daniela.ospina@ejemplo1.co", modulesCompleted: 1, lessonsInNext: 2 }, // ~22%
  { name: "Santiago Vargas",   email: "santiago.vargas@ejemplo1.co",modulesCompleted: 0, lessonsInNext: 1 }, // ~4%
];

async function main() {
  const passwordHash = await bcrypt.hash("Cursia2025!", 10);

  for (const emp of EMPLOYEES) {
    console.log(`\n→ Procesando: ${emp.name}`);

    // 1. Crear usuario
    const user = await prisma.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email:    emp.email,
        name:     emp.name,
        password: passwordHash,
        role:     "EMPLOYEE",
        companies: { connect: { id: COMPANY_ID } },
        contracts: { connect: { id: CONTRACT_ID } },
      },
    });
    console.log(`  ✓ Usuario: ${user.id}`);

    // 2. Crear enrollment
    const totalLessons = MODULES.reduce((s, m) => s + m.lessons.length, 0);
    const completedLessons =
      MODULES.slice(0, emp.modulesCompleted).reduce((s, m) => s + m.lessons.length, 0) +
      emp.lessonsInNext;
    const timeSpent = completedLessons * 420; // ~7 min por lección

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: COURSE_ID } },
      update: {},
      create: {
        userId:        user.id,
        courseId:      COURSE_ID,
        companyId:     COMPANY_ID,
        status:        completedLessons === totalLessons ? "COMPLETED" : "IN_PROGRESS",
        startedAt:     new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // hace 2 semanas
        totalTimeSpent: timeSpent,
      },
    });
    console.log(`  ✓ Enrollment: ${enrollment.id}`);

    // 3. Crear LessonProgress y ModuleProgress para los módulos completos
    for (let mi = 0; mi < emp.modulesCompleted; mi++) {
      const mod = MODULES[mi];
      for (const lessonId of mod.lessons) {
        await prisma.lessonProgress.upsert({
          where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
          update: {},
          create: {
            enrollmentId: enrollment.id,
            lessonId,
            completed:    true,
            timeSpent:    420,
            completedAt:  new Date(Date.now() - 1000 * 60 * 60 * 24 * (7 - mi)),
          },
        });
      }
      await prisma.moduleProgress.upsert({
        where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: mod.id } },
        update: {},
        create: {
          enrollmentId: enrollment.id,
          moduleId:     mod.id,
          completed:    true,
          timeSpent:    mod.lessons.length * 420,
          completedAt:  new Date(Date.now() - 1000 * 60 * 60 * 24 * (7 - mi)),
        },
      });
    }

    // 4. Crear LessonProgress parcial del módulo en curso
    if (emp.modulesCompleted < MODULES.length && emp.lessonsInNext > 0) {
      const currentMod = MODULES[emp.modulesCompleted];
      for (let li = 0; li < emp.lessonsInNext; li++) {
        await prisma.lessonProgress.upsert({
          where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: currentMod.lessons[li] } },
          update: {},
          create: {
            enrollmentId: enrollment.id,
            lessonId:     currentMod.lessons[li],
            completed:    true,
            timeSpent:    420,
            completedAt:  new Date(Date.now() - 1000 * 60 * 60 * 3),
          },
        });
      }
      await prisma.moduleProgress.upsert({
        where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: currentMod.id } },
        update: {},
        create: {
          enrollmentId: enrollment.id,
          moduleId:     currentMod.id,
          completed:    false,
          timeSpent:    emp.lessonsInNext * 420,
        },
      });
    }

    console.log(`  ✓ Progreso registrado (${completedLessons}/${totalLessons} lecciones)`);
  }

  console.log("\n✅ Seed completado exitosamente.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Error:", e.message);
    prisma.$disconnect();
    process.exit(1);
  });
