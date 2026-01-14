import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, CheckCircle, Clock } from "lucide-react";

export default async function AdminDashboard() {
  const [coursesCount, usersCount, publishedCourses, totalEnrollments] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.course.count({ where: { status: "PUBLISHED" } }),
    prisma.enrollment.count(),
  ]);

  const stats = [
    {
      title: "Total Cursos",
      value: coursesCount,
      icon: BookOpen,
      description: "Cursos creados",
    },
    {
      title: "Cursos Publicados",
      value: publishedCourses,
      icon: CheckCircle,
      description: "Disponibles para empresas",
    },
    {
      title: "Total Usuarios",
      value: usersCount,
      icon: Users,
      description: "En el sistema",
    },
    {
      title: "Inscripciones",
      value: totalEnrollments,
      icon: Clock,
      description: "Total de inscripciones",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen general de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

