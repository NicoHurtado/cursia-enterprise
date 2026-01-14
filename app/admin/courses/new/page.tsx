import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/admin/course-form";

export default async function NewCoursePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Curso</h1>
        <p className="text-muted-foreground">
          Crea un nuevo curso desde cero
        </p>
      </div>
      <CourseForm companies={companies} creatorId={session.user.id} />
    </div>
  );
}

