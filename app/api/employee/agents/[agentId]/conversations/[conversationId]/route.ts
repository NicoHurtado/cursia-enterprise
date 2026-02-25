import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthorizedAgent(userId: string, sessionCompanyId: string | null, agentId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { companies: { select: { id: true } } },
  });
  if (!user) return null;

  const companyIds = user.companies.map((company) => company.id);
  if (sessionCompanyId) companyIds.push(sessionCompanyId);

  return prisma.companyAgent.findFirst({
    where: { id: agentId, companyId: { in: Array.from(new Set(companyIds)) } },
    select: { id: true },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string; conversationId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { agentId, conversationId } = await params;
  const agent = await getAuthorizedAgent(session.user.id, session.user.companyId, agentId);
  if (!agent) return new NextResponse("Agent not found", { status: 404 });

  const conversation = await prisma.agentConversation.findFirst({
    where: { id: conversationId, agentId, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          mode: true,
          confidence: true,
          citations: true,
          createdAt: true,
        },
      },
    },
  });

  if (!conversation) return new NextResponse("Conversation not found", { status: 404 });

  return NextResponse.json({
    id: conversation.id,
    title: conversation.title,
    messages: conversation.messages,
  });
}

