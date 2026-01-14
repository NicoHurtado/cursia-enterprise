
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Analyzing Certification Data...");

  // Fetch all enrollments for testing (or filter by a specific known user email if I knew it, but I'll fetch recent ones)
  const enrollments = await prisma.enrollment.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    include: {
      user: true,
      course: {
        include: {
          finalEvaluation: true
        }
      },
      evaluationAttempts: true
    }
  });

  for (const e of enrollments) {
    console.log(`\nUser: ${e.user.email} | Course: ${e.course.title}`);
    console.log(`Status: ${e.status}`);

    const passingScore = e.course.finalEvaluation?.passingScore ?? 70;
    console.log(`Passing Score Required: ${passingScore}`);

    if (e.evaluationAttempts.length === 0) {
      console.log("  No evaluation attempts.");
    }

    for (const att of e.evaluationAttempts) {
      console.log(`  Attempt ID: ${att.id}`);
      console.log(`    Score: ${att.score}`);
      console.log(`    Passed (DB flag): ${att.passed}`);
      console.log(`    Calculated Pass (${att.score} >= ${passingScore}): ${att.score >= passingScore}`);
    }

    const isCertifiedStrict = e.evaluationAttempts.some(att => att.score >= passingScore);
    console.log(`  => IS CERTIFIED (Strict Limit): ${isCertifiedStrict}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
