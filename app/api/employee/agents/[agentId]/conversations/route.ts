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
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { agentId } = await params;
  const agent = await getAuthorizedAgent(session.user.id, session.user.companyId, agentId);
  if (!agent) return new NextResponse("Agent not found", { status: 404 });

  const conversations = await prisma.agentConversation.findMany({
    where: { agentId, userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  });

  return NextResponse.json(
    conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.messages[0]?.content || "",
    }))
  );
}

