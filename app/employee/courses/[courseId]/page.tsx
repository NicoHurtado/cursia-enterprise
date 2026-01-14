import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { CoursePlayer } from "@/components/employee/course-player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

async function getCourse(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      userId,
    },
    include: {
      course: {
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
          finalEvaluation: true,
        },
      },
      lessonProgress: true,
      moduleProgress: true,
      company: {
        include: {
          contracts: {
            where: {
              status: "ACTIVE",
            },
            orderBy: { endDate: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  return enrollment;
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { courseId } = await params;
  const enrollment = await getCourse(courseId, session.user.id);

  if (enrollment) {
    console.log("SERVER DEBUG: Course Title:", enrollment.course.title);
    console.log("SERVER DEBUG: Final Eval:", enrollment.course.finalEvaluation);
  }

  if (!enrollment) {
    notFound();
  }

  // Check for ANY active contract for this user and course
  const activeContract = await prisma.contract.findFirst({
    where: {
      OR: [
        { users: { some: { id: session.user.id } } },
        { preRegisteredUsers: { some: { email: session.user.email } } },
      ],
      courses: { some: { id: courseId } },
      status: "ACTIVE",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
  });

  if (!activeContract) {
    return (
      <div className="container mx-auto py-20 flex justify-center">
        <Card className="w-full max-w-md border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-6 h-6" />
              Acceso Restringido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">
              No tienes un contrato activo que cubra este curso en este momento.
              Por favor, contacta al administrador de tu empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <CoursePlayer enrollment={enrollment} />;
}

