import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying AI Content Generation ---");

  // 1. Find a lesson to generate content for
  const lesson = await prisma.lesson.findFirst({
    include: { module: { include: { course: true } } }
  });

  if (!lesson) {
    console.error("No lesson found. Please create a course with a lesson first.");
    process.exit(1);
  }

  console.log(`Testing generation for lesson: ${lesson.title}`);
  console.log(`Course: ${lesson.module.course.title}`);

  try {
    const response = await fetch("http://localhost:3000/api/admin/ai/generate-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson.id,
        additionalInstructions: "Include a short poem about Python."
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("PASS: Content generated successfully.");
      console.log("Preview:", data.content.substring(0, 100) + "...");
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
