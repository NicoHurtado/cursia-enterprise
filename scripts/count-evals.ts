
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.finalEvaluation.count();
  console.log(`Total FinalEvaluations: ${count}`);

  const evals = await prisma.finalEvaluation.findMany({
    include: { course: true }
  });

  evals.forEach(e => {
    console.log(`Eval ID: ${e.id} - Course: ${e.course.title} (${e.courseId})`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
