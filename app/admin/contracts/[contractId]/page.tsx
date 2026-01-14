import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { ContractManager } from "@/components/admin/contract-manager";

export default async function ContractPage({
  params,
}: {
  params: Promise<{ contractId: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  const { contractId } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      company: true,
      courses: true,
      users: true,
      preRegisteredUsers: true,
    },
  });

  if (!contract) {
    notFound();
  }

  // Fetch all pre-registered users for this company to allow selection
  const companyUsers = await prisma.preRegisteredUser.findMany({
    where: { companyId: contract.companyId },
  });

  return <ContractManager contract={contract} companyUsers={companyUsers} />;
}
