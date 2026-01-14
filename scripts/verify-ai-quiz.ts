import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying AI Quiz Generation ---");

  // 1. Find a lesson to generate quiz for
  const lesson = await prisma.lesson.findFirst({
    where: { content: { not: "" } }, // Ensure lesson has content
    include: { module: { include: { course: true } } }
  });

  if (!lesson) {
    console.error("No lesson with content found. Please create a lesson with content first.");
    process.exit(1);
  }

  console.log(`Testing quiz generation for lesson: ${lesson.title}`);
  console.log(`Course: ${lesson.module.course.title}`);

  // 2. Call the API (simulated via fetch)
  try {
    const response = await fetch("http://localhost:3000/api/admin/ai/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson.id,
        numQuestions: 2,
        additionalInstructions: "Make one question very easy and one very hard."
      }),
    });

    if (response.ok) {
      const questions = await response.json();
      console.log("PASS: Quiz generated successfully.");
      console.log(`Generated ${questions.length} questions.`);
      console.log("First Question:", questions[0]);
    } else {
      console.error("FAIL: API returned error.", response.status, await response.text());
    }
  } catch (error) {
    console.error("FAIL: Could not connect to API. Is the server running?", error);
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
