
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Find a course request
  const course = await prisma.course.findFirst({
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
      finalEvaluation: true,
    },
  });

  if (!course) {
    console.log("No course found");
    return;
  }

  console.log("Course found:", course.title);
  if (course.modules.length > 0 && course.modules[0].lessons.length > 0) {
    const lesson = course.modules[0].lessons[0];
    console.log("First lesson:", lesson.title);
    console.log("Lesson keys:", Object.keys(lesson));
    console.log("Images value:", lesson.images);
  } else {
    console.log("No lessons in first module or no modules");
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
