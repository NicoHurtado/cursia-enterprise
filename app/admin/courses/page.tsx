import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Eye, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { DuplicateButton } from "@/components/admin/duplicate-button";

async function getCourses() {
  return prisma.course.findMany({
    include: {
      creator: { select: { name: true, email: true } },
      company: { select: { name: true } },
      _count: { select: { modules: true, enrollments: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function CoursesPage() {
  const courses = await getCourses();

  const statusColors = {
    DRAFT: "bg-gray-500",
    IN_REVIEW: "bg-yellow-500",
    APPROVED: "bg-green-500",
    PUBLISHED: "bg-blue-500",
  };

  const statusLabels = {
    DRAFT: "Borrador",
    IN_REVIEW: "En Revisión",
    APPROVED: "Aprobado",
    PUBLISHED: "Publicado",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">
            Gestiona todos los cursos de la plataforma
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Curso
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge className={statusColors[course.status]}>
                  {statusLabels[course.status]}
                </Badge>
              </div>
              <CardDescription>
                {course.description || "Sin descripción"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Módulos: {course._count.modules}</p>
                <p>Inscripciones: {course._count.enrollments}</p>
                {course.company && <p>Empresa: {course.company.name}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/admin/courses/${course.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </Link>
                <Link href={`/admin/courses/${course.id}/test`}>
                  <Button variant="ghost" size="icon" title="Probar curso como estudiante">
                    <Play className="w-4 h-4" />
                  </Button>
                </Link>
                <DeleteButton
                  id={course.id}
                  endpoint="/api/courses"
                  itemName="curso"
                  variant="ghost"
                  size="icon"
                />
                <DuplicateButton
                  courseId={course.id}
                  variant="ghost"
                  size="icon"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay cursos creados aún
            </p>
            <Link href="/admin/courses/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear primer curso
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

