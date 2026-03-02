import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/admin/delete-button";
import { AssessmentCopyLink } from "@/components/admin/assessment-copy-link";

async function getAssessments() {
  return prisma.freeAssessment.findMany({
    include: {
      _count: { select: { attempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AssessmentsPage() {
  const assessments = await getAssessments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluaciones Gratuitas</h1>
          <p className="text-muted-foreground">
            Crea evaluaciones y comparte el link con empresas potenciales
          </p>
        </div>
        <Link href="/admin/assessments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Evaluación
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assessments.map((assessment) => {
          const questions = assessment.questions as Array<{ question: string; idealAnswer: string }>;
          return (
            <Card key={assessment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{assessment.title}</CardTitle>
                  <Badge className={assessment.isActive ? "bg-green-500" : "bg-gray-500"}>
                    {assessment.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
                <CardDescription>
                  {assessment.description || "Sin descripción"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Preguntas: {questions.length}</p>
                  <p>Intentos: {assessment._count.attempts}</p>
                  <p>Puntaje mínimo: {assessment.passingScore}%</p>
                  <p>Tiempo: {assessment.timeLimit ? `${assessment.timeLimit} min` : "Sin límite"}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Link href={`/admin/assessments/${assessment.id}`} className="flex-1">
                    <Button variant="outline" className="w-full" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <Link href={`/admin/assessments/${assessment.id}/results`}>
                    <Button variant="ghost" size="icon" title="Ver resultados">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <AssessmentCopyLink assessmentId={assessment.id} />
                  <DeleteButton
                    id={assessment.id}
                    endpoint="/api/admin/assessments"
                    itemName="evaluación"
                    variant="ghost"
                    size="icon"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {assessments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              No hay evaluaciones creadas aún
            </p>
            <Link href="/admin/assessments/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Crear primera evaluación
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
