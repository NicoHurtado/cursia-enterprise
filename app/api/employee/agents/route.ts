import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { companies: { select: { id: true } } },
  });
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const companyIds = user.companies.map((company) => company.id);
  if (session.user.companyId) {
    companyIds.push(session.user.companyId);
  }

  const agents = await prisma.companyAgent.findMany({
    where: {
      companyId: { in: Array.from(new Set(companyIds)) },
    },
    include: {
      company: { select: { id: true, name: true } },
      _count: { select: { sourceDocuments: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(agents);
}

