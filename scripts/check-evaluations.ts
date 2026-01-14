
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking courses with final evaluations...");

  const courses = await prisma.course.findMany({
    include: {
      finalEvaluation: true,
    },
  });

  console.log(`Found ${courses.length} courses.`);

  for (const course of courses) {
    console.log(`Course: ${course.title} (${course.id})`);
    if (course.finalEvaluation) {
      console.log(`  - Has Final Evaluation: YES (ID: ${course.finalEvaluation.id})`);
    } else {
      console.log(`  - Has Final Evaluation: NO`);
    }
  }

  console.log("\nChecking enrollments...");
  const enrollments = await prisma.enrollment.findMany({
    take: 5,
    include: {
      course: {
        include: {
          finalEvaluation: true,
        },
      },
    },
  });

  for (const enrollment of enrollments) {
    console.log(`Enrollment: ${enrollment.id} for Course: ${enrollment.course.title}`);
    if (enrollment.course.finalEvaluation) {
      console.log(`  - Course has Final Evaluation: YES`);
    } else {
      console.log(`  - Course has Final Evaluation: NO`);
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
