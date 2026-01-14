import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseEditor } from "@/components/admin/course-editor";

async function getCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
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

  return course;
}

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return <CourseEditor course={course} />;
}

