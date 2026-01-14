import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { CompanyManager } from "@/components/admin/company-manager";

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      contracts: {
        orderBy: { createdAt: "desc" },
        include: { courses: true, _count: { select: { users: true, preRegisteredUsers: true } } }
      },
      preRegisteredUsers: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!company) {
    notFound();
  }

  return <CompanyManager company={company} />;
}
