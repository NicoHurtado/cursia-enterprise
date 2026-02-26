import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { AgentSourceAlternative } from "@/lib/agents/types";
import { cosineSimilarity } from "@/lib/agents/retrieval";

const TOPIC_STOPWORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "en",
  "un",
  "una",
  "que",
  "con",
  "por",
  "para",
  "del",
  "al",
  "se",
  "es",
  "su",
  "sus",
  "como",
  "si",
  "no",
  "lo",
  "le",
  "les",
  "ya",
  "mas",
  "muy",
  "cual",
  "cuál",
  "donde",
  "dónde",
  "cuando",
  "cuándo",
]);

function normalizeToken(token: string) {
  return token
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function tokenizeForTopic(text: string) {
  return text
    .split(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]+/g)
    .map(normalizeToken)
    .filter((token) => token.length >= 3 && !TOPIC_STOPWORDS.has(token));
}

export function normalizeQuestion(text: string) {
  return normalizeToken(text).replace(/\s+/g, " ").trim();
}

function toJsonOrNull(value: unknown) {
  return value === null || value === undefined
    ? Prisma.JsonNull
    : (value as Prisma.InputJsonValue);
}

function deriveTopic(tokens: string[]) {
  if (tokens.length === 0) {
    return { key: "general", label: "General" };
  }
  const counts = new Map<string, number>();
  tokens.forEach((token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
  });
  const ordered = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((item) => item[0]);
  const key = ordered.join("-");
  const label = ordered.map((token) => token.charAt(0).toUpperCase() + token.slice(1)).join(" / ");
  return { key, label };
}

interface RecordQuestionEventInput {
  agentId: string;
  conversationId?: string | null;
  userId?: string | null;
  questionText: string;
  questionEmbedding?: number[] | null;
  answerText?: string | null;
  mode?: string | null;
  confidence?: number | null;
  citationsSnapshot?: unknown;
  hasImage?: boolean;
  imageType?: string | null;
  imageAnalysisStatus?: "ok" | "partial" | "failed" | "none";
  selectedSourceDocumentId?: string | null;
  alternatives?: AgentSourceAlternative[];
}

export async function recordQuestionEvent(input: RecordQuestionEventInput) {
  const normalizedQuestion = normalizeQuestion(input.questionText);
  const tokens = tokenizeForTopic(input.questionText);
  const topic = deriveTopic(tokens);
  const resolution =
    input.mode === "ambiguous"
      ? "AMBIGUOUS"
      : input.mode === "fallback"
      ? "UNRESOLVED"
      : input.answerText && input.answerText.trim().length > 0
      ? "ANSWERED"
      : "UNRESOLVED";

  const topicRow = await prisma.agentQuestionTopic.upsert({
    where: {
      agentId_normalizedKey: {
        agentId: input.agentId,
        normalizedKey: topic.key,
      },
    },
    update: {
      name: topic.label,
      questionCount: { increment: 1 },
      answeredCount: input.answerText ? { increment: 1 } : undefined,
      unresolvedCount: resolution === "UNRESOLVED" ? { increment: 1 } : undefined,
      ambiguousCount: input.mode === "ambiguous" ? { increment: 1 } : undefined,
      lastAskedAt: new Date(),
    },
    create: {
      agentId: input.agentId,
      name: topic.label,
      normalizedKey: topic.key,
      questionCount: 1,
      answeredCount: input.answerText ? 1 : 0,
      unresolvedCount: resolution === "UNRESOLVED" ? 1 : 0,
      ambiguousCount: input.mode === "ambiguous" ? 1 : 0,
      lastAskedAt: new Date(),
    },
  });

  const candidateClusters = await prisma.agentQuestionCluster.findMany({
    where: {
      agentId: input.agentId,
      topicId: topicRow.id,
    },
    orderBy: { lastAskedAt: "desc" },
    take: 40,
  });
  let targetCluster = candidateClusters.find(
    (cluster) => cluster.normalizedQuestionKey === normalizedQuestion
  );

  if (!targetCluster && input.questionEmbedding?.length) {
    let bestId: string | null = null;
    let bestScore = -1;
    candidateClusters.forEach((cluster) => {
      const clusterEmbedding = (cluster.centroidEmbedding as number[] | null) || null;
      if (!clusterEmbedding || clusterEmbedding.length !== input.questionEmbedding?.length) return;
      const score = cosineSimilarity(input.questionEmbedding!, clusterEmbedding);
      if (score > bestScore) {
        bestScore = score;
        bestId = cluster.id;
      }
    });
    if (bestId && bestScore >= 0.83) {
      targetCluster = candidateClusters.find((cluster) => cluster.id === bestId);
    }
  }

  if (!targetCluster) {
    targetCluster = await prisma.agentQuestionCluster.create({
      data: {
        agentId: input.agentId,
        topicId: topicRow.id,
        canonicalQuestion: input.questionText,
        normalizedQuestionKey: normalizedQuestion,
        centroidEmbedding: toJsonOrNull(input.questionEmbedding || null),
        questionCount: 0,
      },
    });
  }

  const imageMetadata = {
    hasImage: !!input.hasImage,
    imageType: input.imageType || null,
    analysisStatus: input.imageAnalysisStatus || "none",
  };

  const event = await prisma.agentQuestionEvent.create({
    data: {
      agentId: input.agentId,
      conversationId: input.conversationId || null,
      userId: input.userId || null,
      topicId: topicRow.id,
      clusterId: targetCluster.id,
      questionText: input.questionText,
      normalizedQuestion,
      questionEmbedding: toJsonOrNull(input.questionEmbedding || null),
      answerText: input.answerText || null,
      mode: input.mode || null,
      confidence: input.confidence || null,
      hasAnswer: !!input.answerText,
      resolution: resolution as "ANSWERED" | "UNRESOLVED" | "AMBIGUOUS",
      imageMetadata: toJsonOrNull(imageMetadata),
      citationsSnapshot: toJsonOrNull(input.citationsSnapshot || null),
      selectedSourceDocumentId: input.selectedSourceDocumentId || null,
    },
  });

  await prisma.agentQuestionCluster.update({
    where: { id: targetCluster.id },
    data: {
      questionCount: { increment: 1 },
      answeredCount: input.answerText ? { increment: 1 } : undefined,
      unresolvedCount: resolution === "UNRESOLVED" ? { increment: 1 } : undefined,
      ambiguousCount: input.mode === "ambiguous" ? { increment: 1 } : undefined,
      lastAnswer: input.answerText || undefined,
      lastMode: input.mode || undefined,
      lastConfidence: input.confidence || undefined,
      lastAskedAt: new Date(),
      centroidEmbedding: input.questionEmbedding
        ? (input.questionEmbedding as Prisma.InputJsonValue)
        : undefined,
    },
  });

  let ambiguityEventId: string | null = null;
  if (input.mode === "ambiguous" && input.alternatives?.length) {
    const ambiguity = await prisma.agentAmbiguityEvent.create({
      data: {
        agentId: input.agentId,
        conversationId: input.conversationId || null,
        questionEventId: event.id,
        questionText: input.questionText,
        alternatives: toJsonOrNull(input.alternatives || null),
      },
    });
    ambiguityEventId = ambiguity.id;
  }

  return { eventId: event.id, ambiguityEventId };
}

export async function resolveAmbiguityEvent(input: {
  ambiguityEventId: string;
  selectedSourceDocumentId: string;
}) {
  const ambiguity = await prisma.agentAmbiguityEvent.update({
    where: { id: input.ambiguityEventId },
    data: {
      selectedSourceDocumentId: input.selectedSourceDocumentId,
      resolvedAt: new Date(),
    },
    select: { questionEventId: true, agentId: true },
  });

  if (ambiguity.questionEventId) {
    await prisma.agentQuestionEvent.update({
      where: { id: ambiguity.questionEventId },
      data: {
        selectedSourceDocumentId: input.selectedSourceDocumentId,
        resolution: "ANSWERED",
      },
    });
  }

  return ambiguity;
}

