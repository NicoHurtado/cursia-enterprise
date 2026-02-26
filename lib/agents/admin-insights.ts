import { prisma } from "@/lib/prisma";

interface AgentInsightsFilters {
  days?: number;
  agentId?: string;
  companyId?: string;
}

export async function getAgentInsights(filters: AgentInsightsFilters) {
  const days = Math.min(120, Math.max(1, filters.days || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const agentWhere = {
    ...(filters.agentId ? { id: filters.agentId } : {}),
    ...(filters.companyId ? { companyId: filters.companyId } : {}),
  };

  const agents = await prisma.companyAgent.findMany({
    where: agentWhere,
    select: { id: true },
  });
  const agentIds = agents.map((agent) => agent.id);
  if (agentIds.length === 0) {
    return {
      summary: {
        totalQuestions: 0,
        totalAnswered: 0,
        totalUnresolved: 0,
        totalAmbiguous: 0,
      },
      topAnswered: [],
      topUnresolved: [],
      topAmbiguous: [],
      topTopics: [],
      unresolvedAmbiguities: [],
    };
  }

  const [summary, topAnswered, topUnresolved, topAmbiguousEvents, topTopics, unresolvedAmbiguities] =
    await Promise.all([
      prisma.agentQuestionEvent.groupBy({
        by: ["resolution"],
        where: {
          agentId: { in: agentIds },
          createdAt: { gte: since },
        },
        _count: { _all: true },
      }),
      prisma.agentQuestionCluster.findMany({
        where: {
          agentId: { in: agentIds },
          lastAskedAt: { gte: since },
          answeredCount: { gt: 0 },
        },
        orderBy: [{ answeredCount: "desc" }, { questionCount: "desc" }],
        take: 12,
        select: {
          id: true,
          canonicalQuestion: true,
          lastAnswer: true,
          questionCount: true,
          answeredCount: true,
          lastAskedAt: true,
          topic: { select: { name: true } },
          agent: { select: { name: true, company: { select: { name: true } } } },
        },
      }),
      prisma.agentQuestionCluster.findMany({
        where: {
          agentId: { in: agentIds },
          lastAskedAt: { gte: since },
          unresolvedCount: { gt: 0 },
        },
        orderBy: [{ unresolvedCount: "desc" }, { questionCount: "desc" }],
        take: 12,
        select: {
          id: true,
          canonicalQuestion: true,
          questionCount: true,
          unresolvedCount: true,
          lastMode: true,
          lastAskedAt: true,
          topic: { select: { name: true } },
          agent: { select: { name: true, company: { select: { name: true } } } },
        },
      }),
      prisma.agentAmbiguityEvent.findMany({
        where: {
          agentId: { in: agentIds },
          createdAt: { gte: since },
        },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          questionText: true,
          selectedSourceDocumentId: true,
          resolvedAt: true,
          createdAt: true,
          alternatives: true,
        },
      }),
      prisma.agentQuestionTopic.findMany({
        where: {
          agentId: { in: agentIds },
          lastAskedAt: { gte: since },
        },
        orderBy: [{ questionCount: "desc" }],
        take: 12,
        select: {
          id: true,
          name: true,
          questionCount: true,
          answeredCount: true,
          unresolvedCount: true,
          ambiguousCount: true,
          lastAskedAt: true,
          agent: { select: { name: true, company: { select: { name: true } } } },
        },
      }),
      prisma.agentAmbiguityEvent.findMany({
        where: {
          agentId: { in: agentIds },
          createdAt: { gte: since },
          resolvedAt: null,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          questionText: true,
          alternatives: true,
          createdAt: true,
          agent: { select: { name: true, company: { select: { name: true } } } },
        },
      }),
    ]);

  const summaryMap = new Map(summary.map((row) => [row.resolution, row._count._all]));
  const groupedAmbiguities = new Map<
    string,
    {
      questionText: string;
      count: number;
      resolvedCount: number;
      lastCreatedAt: Date;
    }
  >();
  topAmbiguousEvents.forEach((event) => {
    const key = event.questionText.trim().toLowerCase();
    const prev = groupedAmbiguities.get(key);
    if (!prev) {
      groupedAmbiguities.set(key, {
        questionText: event.questionText,
        count: 1,
        resolvedCount: event.resolvedAt ? 1 : 0,
        lastCreatedAt: event.createdAt,
      });
      return;
    }
    prev.count += 1;
    if (event.resolvedAt) prev.resolvedCount += 1;
    if (event.createdAt > prev.lastCreatedAt) prev.lastCreatedAt = event.createdAt;
  });
  const topAmbiguous = Array.from(groupedAmbiguities.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return {
    summary: {
      totalQuestions: summary.reduce((acc, row) => acc + row._count._all, 0),
      totalAnswered: summaryMap.get("ANSWERED") || 0,
      totalUnresolved: summaryMap.get("UNRESOLVED") || 0,
      totalAmbiguous: summaryMap.get("AMBIGUOUS") || 0,
    },
    topAnswered,
    topUnresolved,
    topAmbiguous,
    topTopics,
    unresolvedAmbiguities,
  };
}

