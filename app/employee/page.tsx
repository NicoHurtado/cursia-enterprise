import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Play, CheckCircle, Clock } from "lucide-react";
import { formatTime, formatPercentage } from "@/lib/utils";

async function getEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              _count: {
                select: { lessons: true }
              }
            }
          }
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

  const getProgress = (enrollment: any) => {
    const totalLessons = enrollment.course.modules.reduce(
      (acc: number, mod: any) => acc + mod._count.lessons,
      0
    );
    const completedLessons = enrollment.lessonProgress.filter(
      (lp: any) => lp.completed
    ).length;
    return formatPercentage(completedLessons, totalLessons);
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
    <div className="space-y-10 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cursia-blue to-indigo-700 p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            ¡Hola, {session.user.name?.split(' ')[0] || 'Estudiante'}!
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium opacity-90">
            Tu viaje de aprendizaje continúa hoy. Tienes {validEnrollments.length} cursos activos esperándote.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 ml-40 -mb-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cursia-blue" />
            Mis Cursos Activos
          </h2>
          <div className="h-px flex-1 mx-6 bg-slate-200 hidden md:block" />
          <p className="text-sm font-semibold text-slate-500 bg-slate-100 px-4 py-1.5 rounded-full">
            {validEnrollments.length} Inscripciones
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {validEnrollments.map((enrollment) => {
            const progress = getProgress(enrollment);
            const status = getStatusBadge(enrollment.status);
            const course = enrollment.course as any;

            return (
              <Card
                key={enrollment.id}
                className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={course.coverImage || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60"}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4">
                    <Badge className={`${status.color} border-none text-white font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md`}>
                      {status.label}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="space-y-2 pb-2">
                  <CardTitle className="text-xl font-bold text-slate-800 line-clamp-2 min-h-[3.5rem] group-hover:text-cursia-blue transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-slate-500 text-sm">
                    {course.description || "Inicia este increíble recorrido de aprendizaje diseñado para ti."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 pt-2">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="text-slate-500 uppercase tracking-wider text-xs">Tu Progreso</span>
                      <span className="text-cursia-blue">{progress}%</span>
                    </div>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-100">
                        <div
                          style={{ width: `${progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-cursia-blue to-indigo-500 transition-all duration-1000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-slate-50">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                      <Clock className="w-4 h-4" />
                      {formatTime(enrollment.totalTimeSpent)}
                    </div>
                    {progress === 100 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <CheckCircle className="w-4 h-4" />
                        Completado
                      </div>
                    )}
                  </div>

                  <Link href={`/employee/courses/${course.id}`} className="block">
                    <Button
                      className={`w-full h-12 rounded-2xl font-bold text-base transition-all duration-300 transform group-hover:-translate-y-1 shadow-md hover:shadow-xl ${enrollment.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-cursia-blue hover:bg-cursia-blue/90 text-white"
                        }`}
                    >
                      {enrollment.status === "COMPLETED" ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Repasar Curso
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2 fill-current" />
                          {enrollment.status === "NOT_STARTED" ? "Empezar Ahora" : "Continuar Aprendiendo"}
                        </>
                      )}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {validEnrollments.length === 0 && (
        <Card className="rounded-3xl border-dashed border-2 border-slate-200 bg-slate-50/50">
          <CardContent className="py-20 text-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl text-slate-300">
              <BookOpen className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No hay cursos aún</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-4">
              Aún no tienes cursos asignados. Pronto verás contenido increíble diseñado para tu crecimiento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

