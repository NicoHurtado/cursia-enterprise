import { prisma } from "@/lib/prisma";
import { splitIntoChunks } from "@/lib/agents/chunking";
import { embedTexts } from "@/lib/agents/embedding-provider";
import { buildLexicalVector } from "@/lib/agents/retrieval";

interface IngestAgentSourceInput {
  agentId: string;
  title: string;
  sourceType: "TEXT" | "FILE";
  rawText: string;
  mimeType?: string;
  filePath?: string;
}

export async function ingestAgentSource(input: IngestAgentSourceInput) {
  const source = await prisma.agentSourceDocument.create({
    data: {
      agentId: input.agentId,
      title: input.title,
      sourceType: input.sourceType,
      rawText: input.rawText,
      mimeType: input.mimeType,
      filePath: input.filePath,
      status: "PROCESSING",
    },
  });

  try {
    const chunks = splitIntoChunks(input.rawText);
    if (chunks.length === 0) {
      throw new Error("No se encontraron bloques de texto para indexar.");
    }

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

    await prisma.agentChunk.createMany({
      data: chunks.map((chunk, idx) => ({
        agentId: input.agentId,
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

    await prisma.agentSourceDocument.update({
      where: { id: source.id },
      data: { status: "READY" },
    });
  } catch (error) {
    await prisma.agentSourceDocument.update({
      where: { id: source.id },
      data: { status: "FAILED" },
    });
    throw error;
  }

  return source;
}

