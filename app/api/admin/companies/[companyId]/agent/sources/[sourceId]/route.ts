import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string; sourceId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId, sourceId } = await params;

  const source = await prisma.agentSourceDocument.findFirst({
    where: {
      id: sourceId,
      agent: { companyId },
    },
  });

  if (!source) {
    return new NextResponse("Source not found", { status: 404 });
  }

  await prisma.agentSourceDocument.delete({ where: { id: source.id } });
  return new NextResponse(null, { status: 204 });
}

