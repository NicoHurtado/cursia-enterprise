import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CertificateGenerator } from "@/components/certificate-generator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function CertificatesPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch completed enrollments with course and company details
  const completedEnrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      status: "COMPLETED",
      evaluationAttempts: {
        some: { passed: true }
      }
    },
    include: {
      course: true,
      company: true,
      user: true,
    },
    orderBy: {
      completedAt: "desc",
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mis Certificados</h1>
        <p className="text-muted-foreground">
          Descarga los certificados de los cursos que has completado.
        </p>
      </div>

      {completedEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Aún no has completado ningún curso. ¡Sigue aprendiendo!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedEnrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden">
              <div className="h-2 bg-primary w-full" />
              <CardHeader>
                <CardTitle>{enrollment.course.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {enrollment.company.name}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <p className="font-medium">Completado el:</p>
                  <p className="text-muted-foreground">
                    {enrollment.completedAt
                      ? format(enrollment.completedAt, "PPP", { locale: es })
                      : "Fecha desconocida"}
                  </p>
                </div>

                <CertificateGenerator
                  studentName={enrollment.user.name || "Estudiante"}
                  studentId={enrollment.user.nationalId || undefined}
                  studentEmail={enrollment.user.email || ""}
                  courseName={enrollment.course.title}
                  companyName={enrollment.company.name}
                  completionDate={enrollment.completedAt || new Date()}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
