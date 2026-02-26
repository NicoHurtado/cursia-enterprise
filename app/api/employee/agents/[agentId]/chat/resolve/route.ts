import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { embedSingleText } from "@/lib/agents/embedding-provider";
import { generateAgentAnswer } from "@/lib/agents/generation";
import { recordQuestionEvent, resolveAmbiguityEvent } from "@/lib/agents/question-insights";

const resolveSchema = z.object({
  conversationId: z.string().min(1),
  question: z.string().min(1).max(2000),
  selectedChunkId: z.string().min(1),
  ambiguityEventId: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { agentId } = await params;

  try {
    const body = resolveSchema.parse(await req.json());
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { companies: { select: { id: true } } },
    });
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const companyIds = user.companies.map((company) => company.id);
    if (session.user.companyId) companyIds.push(session.user.companyId);

    const agent = await prisma.companyAgent.findFirst({
      where: {
        id: agentId,
        isEnabled: true,
        companyId: { in: Array.from(new Set(companyIds)) },
      },
      select: {
        id: true,
        generalInstructions: true,
      },
    });
    if (!agent) return new NextResponse("Agent not found", { status: 404 });

    const conversation = await prisma.agentConversation.findFirst({
      where: {
        id: body.conversationId,
        userId: session.user.id,
        agentId: agent.id,
      },
      select: { id: true },
    });
    if (!conversation) return new NextResponse("Conversation not found", { status: 404 });

    const selectedChunk = await prisma.agentChunk.findFirst({
      where: {
        id: body.selectedChunkId,
        agentId: agent.id,
      },
      include: {
        document: {
          select: { id: true, title: true, filePath: true },
        },
      },
    });
    if (!selectedChunk) {
      return NextResponse.json(
        { message: "La fuente seleccionada ya no está disponible." },
        { status: 404 }
      );
    }

    const answer = await generateAgentAnswer({
      question: body.question,
      mode: "grounded",
      instructions: agent.generalInstructions,
      chunks: [
        {
          id: selectedChunk.id,
          documentId: selectedChunk.documentId,
          documentTitle: selectedChunk.document.title,
          content: selectedChunk.content,
          score: 1,
        },
      ],
    });

    const citations = [
      {
        documentId: selectedChunk.documentId,
        title: selectedChunk.document.title,
        excerpt: selectedChunk.content.slice(0, 240),
        score: 1,
        chunkId: selectedChunk.id,
        fileUrl: selectedChunk.document.filePath || null,
      },
    ];

    await prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: answer,
        mode: "grounded",
        confidence: 0.96,
        citations,
      },
    });

    await prisma.agentConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    const { vector: queryVector } = await embedSingleText(body.question);
    await recordQuestionEvent({
      agentId: agent.id,
      conversationId: conversation.id,
      userId: session.user.id,
      questionText: body.question,
      questionEmbedding: queryVector,
      answerText: answer,
      mode: "grounded",
      confidence: 0.96,
      citationsSnapshot: citations,
      selectedSourceDocumentId: selectedChunk.documentId,
    });

    if (body.ambiguityEventId) {
      await resolveAmbiguityEvent({
        ambiguityEventId: body.ambiguityEventId,
        selectedSourceDocumentId: selectedChunk.documentId,
      });
    }

    return NextResponse.json({
      mode: "grounded",
      confidence: 0.96,
      answer,
      citations,
      conversationId: conversation.id,
      requiresSourceSelection: false,
      alternatives: [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ issues: error.issues }, { status: 400 });
    }
    console.error("Resolve ambiguity error:", error);
    return NextResponse.json(
      { message: "No pude resolver la ambigüedad en este momento." },
      { status: 500 }
    );
  }
}

