import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string; sourceId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { agentId, sourceId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { companies: { select: { id: true } } },
  });
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const companyIds = user.companies.map((company) => company.id);
  if (session.user.companyId) {
    companyIds.push(session.user.companyId);
  }

  const source = await prisma.agentSourceDocument.findFirst({
    where: {
      id: sourceId,
      agentId,
      status: "READY",
      agent: { companyId: { in: Array.from(new Set(companyIds)) } },
    },
    select: {
      id: true,
      title: true,
      rawText: true,
      filePath: true,
      mimeType: true,
      updatedAt: true,
    },
  });

  if (!source) {
    return new NextResponse("Source not found", { status: 404 });
  }

  return NextResponse.json(source);
}

