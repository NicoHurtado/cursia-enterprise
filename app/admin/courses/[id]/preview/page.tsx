import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CoursePreview } from "@/components/admin/course-preview";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

async function getCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      modules: {
        include: {
          lessons: {
            include: {
              quizzes: {
                orderBy: { order: "asc" },
              },
              flashcards: {
                orderBy: { order: "asc" },
              },
            },
            orderBy: { order: "asc" },
          },
        },
        orderBy: { order: "asc" },
      },
      finalEvaluation: true,
      creator: { select: { name: true } },
      company: { select: { name: true } },
    },
  });

  return course;
}

export default async function CoursePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/courses/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Previsualización del Curso</h1>
            <p className="text-muted-foreground">
              Vista como la verán los empleados
            </p>
          </div>
        </div>
      </div>

      <CoursePreview course={course} />
    </div>
  );
}



