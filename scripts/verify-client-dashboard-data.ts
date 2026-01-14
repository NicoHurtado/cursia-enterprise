
import { prisma } from "../lib/prisma";

async function main() {
  console.log("Verifying Client Dashboard Data Fetching...");

  // 1. Mock finding an admin user (Assuming one exists or picking the first one with a company)
  const adminUser = await prisma.user.findFirst({
    where: {
      companies: {
        some: {}
      }
    },
    include: { companies: true }
  });

  if (!adminUser) {
    console.error("No admin user with company found.");
    return;
  }

  const companyId = adminUser.companies[0].id;
  console.log(`Found Admin: ${adminUser.email}, Company ID: ${companyId}`);

  // 2. Fetch Users for the company with progress stats
  const employees = await prisma.user.findMany({
    where: {
      companies: { some: { id: companyId } },
      role: "EMPLOYEE",
    },
    include: {
      enrollments: {
        where: { companyId },
        include: {
          course: { select: { title: true } },
          moduleProgress: true,
          quizAttempts: true,
          evaluationAttempts: true
        }
      }
    },
    take: 5
  });

  console.log(`Found ${employees.length} employees.`);

  for (const emp of employees) {
    console.log(`\nEmployee: ${emp.name} (${emp.email})`);
    for (const enrollment of emp.enrollments) {
      console.log(`  Course: ${enrollment.course.title}`);
      console.log(`  Status: ${enrollment.status}`);
      console.log(`  Total Time: ${enrollment.totalTimeSpent} ms`);

      const modulesCompleted = enrollment.moduleProgress.filter(m => m.completed).length;
      console.log(`  Modules: ${modulesCompleted} completed`);

      if (enrollment.quizAttempts.length > 0) {
        const avgQuiz = enrollment.quizAttempts.reduce((acc, curr) => acc + curr.score, 0) / enrollment.quizAttempts.length;
        console.log(`  Avg Quiz Score: ${avgQuiz.toFixed(2)}`);
      } else {
        console.log(`  No Quiz Attempts`);
      }

      if (enrollment.evaluationAttempts.length > 0) {
        const latestEval = enrollment.evaluationAttempts[enrollment.evaluationAttempts.length - 1];
        console.log(`  Final Eval: ${latestEval.score} (Passed: ${latestEval.passed})`);
      } else {
        console.log(`  No Final Evaluation`);
      }
    }
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
