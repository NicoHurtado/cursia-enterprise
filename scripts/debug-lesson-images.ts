
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const lessons = await prisma.lesson.findMany({
    take: 5,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      images: true,
    }
  });

  console.log("Checking last 5 lessons:");
  for (const lesson of lessons) {
    console.log(`Lesson: ${lesson.title} (${lesson.id})`);
    console.log(`Images type: ${typeof lesson.images}`);
    console.log(`Images value:`, JSON.stringify(lesson.images, null, 2));
    console.log('---');
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
