import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { splitIntoChunks } from "@/lib/agents/chunking";
import { embedTexts } from "@/lib/agents/embedding-provider";
import { buildLexicalVector } from "@/lib/agents/retrieval";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  const agent = await prisma.companyAgent.findUnique({
    where: { companyId },
    select: {
      id: true,
      sourceDocuments: {
        where: { status: "READY" },
        select: { id: true, title: true, rawText: true },
      },
    },
  });

  if (!agent) {
    return new NextResponse("Agent not found", { status: 404 });
  }

  const results: { title: string; chunks: number; status: string }[] = [];

  for (const source of agent.sourceDocuments) {
    try {
      const newChunks = splitIntoChunks(source.rawText || "");
      if (newChunks.length === 0) {
        results.push({ title: source.title, chunks: 0, status: "skipped" });
        continue;
      }

      const embeddings = await embedTexts(newChunks.map((c) => c.content));

      await prisma.$transaction(async (tx) => {
        await tx.agentChunk.deleteMany({ where: { documentId: source.id } });
        await tx.agentChunk.createMany({
          data: newChunks.map((chunk, idx) => ({
            agentId: agent.id,
            documentId: source.id,
            chunkIndex: chunk.chunkIndex,
            content: chunk.content,
            tokenCount: chunk.tokenCount,
            lexicalVector: buildLexicalVector(chunk.content),
            embeddingProvider: embeddings.provider,
            embeddingModel: embeddings.model,
            embeddingVector: embeddings.vectors[idx],
          })),
        });
      });

      results.push({ title: source.title, chunks: newChunks.length, status: "ok" });
    } catch (error) {
      console.error(`Reindex failed for ${source.title}:`, error);
      results.push({ title: source.title, chunks: 0, status: "error" });
    }
  }

  return NextResponse.json({
    reindexed: results.filter((r) => r.status === "ok").length,
    total: agent.sourceDocuments.length,
    details: results,
  });
}
