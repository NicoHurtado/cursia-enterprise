import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Play, CheckCircle } from "lucide-react";
import { formatTime, formatPercentage } from "@/lib/utils";

async function getEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      lessonProgress: true,
      moduleProgress: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function EmployeeDashboard() {
  const session = await auth();
  if (!session) {
    return null;
  }

  const enrollments = await getEnrollments(session.user.id);

  // Filter enrollments to only show those with an active contract
  const activeContracts = await prisma.contract.findMany({
    where: {
      OR: [
        { users: { some: { id: session.user.id } } },
        { preRegisteredUsers: { some: { email: session.user.email } } },
      ],
      status: "ACTIVE",
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    },
    include: { courses: { select: { id: true } } },
  });

  const availableCourseIds = new Set(
    activeContracts.flatMap((c) => c.courses.map((course) => course.id))
  );

  const validEnrollments = enrollments.filter((e) =>
    availableCourseIds.has(e.courseId)
  );

  const getProgress = (enrollment: typeof enrollments[0]) => {
    const totalLessons = enrollment.lessonProgress.length;
    const completedLessons = enrollment.lessonProgress.filter(
      (lp) => lp.completed
    ).length;
    return totalLessons > 0
      ? formatPercentage(completedLessons, totalLessons)
      : 0;
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      NOT_STARTED: { label: "No Iniciado", color: "bg-gray-500" },
      IN_PROGRESS: { label: "En Curso", color: "bg-yellow-500" },
      COMPLETED: { label: "Completado", color: "bg-green-500" },
    };
    return statusMap[status as keyof typeof statusMap] || statusMap.NOT_STARTED;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Cursos</h1>
        <p className="text-muted-foreground">
          Continúa tu aprendizaje desde donde lo dejaste
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {validEnrollments.map((enrollment) => {
          const progress = getProgress(enrollment);
          const status = getStatusBadge(enrollment.status);

          return (
            <Card key={enrollment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                  <Badge className={status.color}>{status.label}</Badge>
                </div>
                <CardDescription>
                  {enrollment.course.description || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progreso</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Tiempo: {formatTime(enrollment.totalTimeSpent)}</span>
                </div>

                <Link href={`/employee/courses/${enrollment.course.id}`}>
                  <Button className="w-full">
                    {enrollment.status === "COMPLETED" ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Ver Curso
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        {enrollment.status === "NOT_STARTED"
                          ? "Comenzar"
                          : "Continuar"}
                      </>
                    )}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {validEnrollments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No tienes cursos asignados aún. Contacta a tu administrador.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

