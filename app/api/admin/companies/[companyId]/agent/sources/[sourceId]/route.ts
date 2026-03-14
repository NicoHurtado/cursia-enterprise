import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  trackAccess: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string; sourceId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId, sourceId } = await params;
  const body = patchSchema.parse(await req.json());

  const source = await prisma.agentSourceDocument.findFirst({
    where: { id: sourceId, agent: { companyId } },
  });
  if (!source) {
    return new NextResponse("Source not found", { status: 404 });
  }

  const updated = await prisma.agentSourceDocument.update({
    where: { id: source.id },
    data: {
      ...(body.trackAccess !== undefined ? { trackAccess: body.trackAccess } : {}),
    },
    select: { id: true, trackAccess: true },
  });

  return NextResponse.json(updated);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string; sourceId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId, sourceId } = await params;

  const logs = await prisma.agentDocumentAccessLog.findMany({
    where: {
      documentId: sourceId,
      document: { agent: { companyId } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      userEmail: true,
      question: true,
      createdAt: true,
    },
  });

  return NextResponse.json(logs);
}

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
    where: { id: sourceId, agent: { companyId } },
  });
  if (!source) {
    return new NextResponse("Source not found", { status: 404 });
  }

  await prisma.agentSourceDocument.delete({ where: { id: source.id } });
  return new NextResponse(null, { status: 204 });
}

