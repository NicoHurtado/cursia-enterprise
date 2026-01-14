import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying Final Evaluation Fetching ---");

  // 1. Find a course with a final evaluation
  const evaluation = await prisma.finalEvaluation.findFirst({
    include: { course: true }
  });

  if (!evaluation) {
    console.log("No final evaluation found. Creating one for testing...");
    const course = await prisma.course.findFirst();
    if (!course) throw new Error("No course found to attach evaluation to.");

    await prisma.finalEvaluation.create({
      data: {
        courseId: course.id,
        questions: [{ question: "Test Q", options: [] }],
        passingScore: 80
      }
    });
    console.log("Created test evaluation.");
  } else {
    console.log(`Found existing evaluation for course: ${evaluation.course.title}`);
  }

  // 2. Simulate the query from app/admin/courses/[id]/page.tsx
  const courseId = evaluation ? evaluation.courseId : (await prisma.course.findFirst())!.id;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quizzes: true,
              flashcards: true,
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      creator: { select: { name: true } },
      company: { select: { name: true } },
      finalEvaluation: true, // This is what we added
    },
  });

  if (!course) throw new Error("Course not found");

  console.log(`Fetched Course: ${course.title}`);

  if (course.finalEvaluation) {
    console.log("PASS: finalEvaluation is present in the response.");
    console.log(`  Questions: ${JSON.stringify(course.finalEvaluation.questions).substring(0, 50)}...`);
    console.log(`  Passing Score: ${course.finalEvaluation.passingScore}`);
  } else {
    console.error("FAIL: finalEvaluation is MISSING from the response!");
  }

  console.log("--- Verification Complete ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
