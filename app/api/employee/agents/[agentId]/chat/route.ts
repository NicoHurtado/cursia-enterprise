import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { embedSingleText } from "@/lib/agents/embedding-provider";
import { rankChunksBySimilarity } from "@/lib/agents/retrieval";
import { decideEvidenceMode } from "@/lib/agents/answer-policy";
import { generateAgentAnswer } from "@/lib/agents/generation";
import type { AgentSourceAlternative } from "@/lib/agents/types";
import {
  buildImageKnowledgeText,
  isSupportedImageMimeType,
} from "@/lib/agents/image-understanding";
import { recordQuestionEvent } from "@/lib/agents/question-insights";

const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationId: z.string().optional(),
});

function isGreetingMessage(text: string) {
  const normalized = text.trim().toLowerCase();
  return /^(hola|buenas|buenos dias|buen día|buenas tardes|buenas noches)\b/.test(
    normalized
  );
}

function resolveGreetingWord(instructions?: string | null) {
  if (!instructions) return "Hola";
  if (/\bholi\b/i.test(instructions)) return "Holi";
  return "Hola";
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { agentId } = await params;

  try {
    const contentType = req.headers.get("content-type") || "";
    let imageFile: File | null = null;
    let parsedInput: z.infer<typeof chatSchema>;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const rawMessage = String(formData.get("message") || "").trim();
      const rawConversationId = String(formData.get("conversationId") || "").trim();
      const file = formData.get("image");
      imageFile = file instanceof File ? file : null;

      parsedInput = chatSchema.parse({
        message: rawMessage,
        conversationId: rawConversationId || undefined,
      });
    } else {
      parsedInput = chatSchema.parse(await req.json());
    }

    const { message, conversationId } = parsedInput;

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

    const agent = await prisma.companyAgent.findFirst({
      where: {
        id: agentId,
        companyId: { in: Array.from(new Set(companyIds)) },
      },
      select: {
        id: true,
        isEnabled: true,
        generalInstructions: true,
        sourceDocuments: {
          where: { status: "READY" },
          select: { id: true },
        },
      },
    });

    if (!agent) {
      return new NextResponse("Agent not found", { status: 404 });
    }

    let conversation = conversationId
      ? await prisma.agentConversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
          agentId: agent.id,
        },
      })
      : null;

    if (!conversation) {
      conversation = await prisma.agentConversation.create({
        data: {
          userId: session.user.id,
          agentId: agent.id,
          title: message.slice(0, 80),
        },
      });
    }

    if (imageFile) {
      if (!isSupportedImageMimeType(imageFile.type)) {
        return NextResponse.json(
          { message: "Formato de imagen no soportado. Usa PNG, JPG, JPEG o WEBP." },
          { status: 400 }
        );
      }
      if (imageFile.size > 8 * 1024 * 1024) {
        return NextResponse.json(
          { message: "La imagen excede 8MB. Comprime o recorta la imagen." },
          { status: 400 }
        );
      }
    }

    let imageContext = "";
    let imageAnalysisStatus: "ok" | "partial" | "failed" | "none" = "none";
    if (imageFile) {
      try {
        imageContext = await buildImageKnowledgeText(
          imageFile,
          `Analiza esta imagen para ayudar a responder la pregunta del usuario.
Pregunta: "${message}"
Extrae en español: texto visible, cifras, campos, etiquetas, estados, elementos clave y cualquier detalle útil para responder con precisión.`
        );
        imageAnalysisStatus = imageContext.trim() ? "ok" : "partial";
      } catch (imageError) {
        console.error("Image analysis failed:", imageError);
        imageAnalysisStatus = "failed";
      }
    }
    const hasImageContext = !!imageContext.trim();

    await prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "USER",
        content: hasImageContext ? `${message}\n\n[Imagen adjunta]` : message,
        citations: imageFile
          ? {
            hasImage: true,
            imageType: imageFile.type || null,
            imageSize: imageFile.size || null,
            imageAnalysisStatus,
          }
          : undefined,
      },
    });

    if (!agent.isEnabled) {
      const payload = { blocked: true, message: "Este agente está deshabilitado por el administrador." };
      await prisma.agentMessage.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: payload.message,
          mode: "fallback",
          confidence: 0,
          citations: [],
        },
      });
      return NextResponse.json(
        { ...payload, conversationId: conversation.id },
        { status: 403 }
      );
    }

    if (agent.sourceDocuments.length === 0) {
      const greeting = resolveGreetingWord(agent.generalInstructions);
      const payload = {
        mode: "fallback",
        answer: `${greeting}, este agente aún no tiene documentos cargados. Cuando el administrador suba contenido, podré responder con base en fuentes internas.`,
        citations: [],
        confidence: 0,
      };
      await prisma.agentMessage.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: payload.answer,
          mode: payload.mode,
          confidence: payload.confidence,
          citations: payload.citations,
        },
      });
      return NextResponse.json({ ...payload, conversationId: conversation.id });
    }

    if (isGreetingMessage(message) && !hasImageContext) {
      const greeting = resolveGreetingWord(agent.generalInstructions);
      const payload = {
        mode: "grounded",
        confidence: 1,
        answer: `${greeting}, ¿como te puedo ayudar hoy?`,
        citations: [],
      };
      await prisma.agentMessage.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: payload.answer,
          mode: payload.mode,
          confidence: payload.confidence,
          citations: payload.citations,
        },
      });
      return NextResponse.json({ ...payload, conversationId: conversation.id });
    }

    const retrievalQuery = hasImageContext ? `${message}\n${imageContext}` : message;
    const { vector: queryVector } = await embedSingleText(retrievalQuery);
    const readyDocumentIds = agent.sourceDocuments.map(
      (document: { id: string }) => document.id
    );
    const chunks = await prisma.agentChunk.findMany({
      where: {
        agentId: agent.id,
        documentId: { in: readyDocumentIds },
      },
      include: {
        document: {
          select: { id: true, title: true, filePath: true },
        },
      },
    });

    if (chunks.length === 0) {
      const payload = {
        mode: "fallback" as const,
        answer:
          "Tengo documentos asociados, pero todavía no hay contenido indexado para responder. Pide al administrador reindexar o volver a subir el archivo.",
        citations: [],
        confidence: 0,
      };
      await prisma.agentMessage.create({
        data: {
          conversationId: conversation.id,
          role: "ASSISTANT",
          content: payload.answer,
          mode: payload.mode,
          confidence: payload.confidence,
          citations: payload.citations,
        },
      });
      return NextResponse.json({ ...payload, conversationId: conversation.id });
    }

    const ranked = rankChunksBySimilarity(
      retrievalQuery,
      queryVector,
      chunks.map((chunk: {
        id: string;
        documentId: string;
        content: string;
        embeddingVector: unknown;
        lexicalVector: unknown;
        document: { title: string };
      }) => ({
        id: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        content: chunk.content,
        embeddingVector: chunk.embeddingVector as number[],
        lexicalVector: (chunk.lexicalVector as Record<string, number> | null) || null,
      })),
      6
    );

    const decision = decideEvidenceMode(ranked, hasImageContext);
    const effectiveMode = decision.mode;
    const effectiveSelected = decision.selected;

    const answer = await generateAgentAnswer({
      question: message,
      mode: effectiveMode,
      instructions: agent.generalInstructions,
      chunks: effectiveSelected,
      imageContext: hasImageContext ? imageContext : null,
    });

    const citations = effectiveSelected.map(
      (chunk: {
        id: string;
        documentId: string;
        documentTitle: string;
        content: string;
        score: number;
      }) => ({
        chunkId: chunk.id,
        documentId: chunk.documentId,
        title: chunk.documentTitle,
        excerpt: chunk.content.slice(0, 240),
        score: Number(chunk.score.toFixed(4)),
        fileUrl:
          chunks.find(
            (dbChunk: { id: string; document: { filePath: string | null } }) =>
              dbChunk.id === chunk.id
          )?.document.filePath || null,
      })
    );

    const alternatives: AgentSourceAlternative[] | undefined =
      effectiveMode === "ambiguous"
        ? effectiveSelected.map((chunk) => ({
          chunkId: chunk.id,
          documentId: chunk.documentId,
          title: chunk.documentTitle,
          summary: chunk.content.slice(0, 260),
          score: Number(chunk.score.toFixed(4)),
        }))
        : undefined;

    const payload = {
      mode: effectiveMode,
      confidence: Number(decision.confidence.toFixed(4)),
      answer,
      citations,
      alternatives: alternatives || [],
      requiresSourceSelection: effectiveMode === "ambiguous",
    };

    const questionEvent = await recordQuestionEvent({
      agentId: agent.id,
      conversationId: conversation.id,
      userId: session.user.id,
      questionText: message,
      questionEmbedding: queryVector,
      answerText: payload.answer,
      mode: payload.mode,
      confidence: payload.confidence,
      citationsSnapshot: payload.citations,
      hasImage: !!imageFile,
      imageType: imageFile?.type || null,
      imageAnalysisStatus,
      alternatives: alternatives || [],
    });

    await prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content: payload.answer,
        mode: payload.mode,
        confidence: payload.confidence,
        citations: payload.citations,
      },
    });

    await prisma.agentConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      ...payload,
      ambiguityEventId: questionEvent.ambiguityEventId,
      conversationId: conversation.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ issues: error.issues }, { status: 400 });
    }
    console.error("Agent chat error:", error);
    return NextResponse.json(
      {
        message:
          "No pude procesar tu solicitud en este momento. Si adjuntaste imagen, intenta con otra o reduce el tamaño.",
      },
      { status: 500 }
    );
  }
}

