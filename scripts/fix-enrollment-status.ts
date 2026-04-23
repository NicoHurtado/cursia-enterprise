/**
 * Fixes the enrollment status for a user who passed the evaluation
 * but whose enrollment was never marked as COMPLETED because the
 * original grading failed with score=0.
 *
 * Run with: npx tsx scripts/fix-enrollment-status.ts
 */
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const TARGET_EMAIL = "cartera@colegiofontan.edu.co";

async function main() {
  console.log(`\n📡 Database: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0]}`);
  console.log(`🔍 Buscando enrollment de: ${TARGET_EMAIL}\n`);

  const user = await prisma.user.findUnique({
    where: { email: TARGET_EMAIL },
    select: { id: true },
  });

  if (!user) {
    console.error("❌ Usuario no encontrado");
    await prisma.$disconnect();
    process.exit(1);
  }

  // Find enrollment with a passed EvaluationAttempt that has score > 0
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      evaluationAttempts: {
        some: { passed: true, score: { gt: 0 } },
      },
    },
    include: {
      course: { select: { title: true } },
      evaluationAttempts: {
        where: { passed: true, score: { gt: 0 } },
        select: { id: true, score: true, passed: true },
      },
    },
  });

  if (!enrollment) {
    console.log("ℹ️  No se encontró un enrollment con intento aprobado para actualizar.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Enrollment encontrado:`);
  console.log(`  ID:     ${enrollment.id}`);
  console.log(`  Curso:  ${enrollment.course.title}`);
  console.log(`  Status: ${enrollment.status}`);
  console.log(`  Intento aprobado: score=${enrollment.evaluationAttempts[0].score}\n`);

  if (enrollment.status === "COMPLETED") {
    console.log("✅ El enrollment ya está en COMPLETED. No se requiere cambio.");
    await prisma.$disconnect();
    return;
  }

  // Update enrollment to COMPLETED
  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  console.log(`✅ Enrollment actualizado a COMPLETED exitosamente.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
