import { PrismaClient } from "@prisma/client";
import { splitIntoChunks } from "../lib/agents/chunking";
import { embedTexts } from "../lib/agents/embedding-provider";
import { buildLexicalVector } from "../lib/agents/retrieval";

const prisma = new PrismaClient();

async function main() {
  const failedSources = await prisma.agentSourceDocument.findMany({
    where: { status: "FAILED" },
    select: { id: true, agentId: true, rawText: true },
  });

  let fixed = 0;
  for (const source of failedSources) {
    const chunks = splitIntoChunks(source.rawText || "");
    if (chunks.length === 0) {
      continue;
    }

    const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));

    await prisma.$transaction(async (tx) => {
      await tx.agentChunk.deleteMany({ where: { documentId: source.id } });
      await tx.agentChunk.createMany({
        data: chunks.map((chunk, idx) => ({
          agentId: source.agentId,
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

      await tx.agentSourceDocument.update({
        where: { id: source.id },
        data: { status: "READY" },
      });
    });

    fixed += 1;
  }

  console.log(`reprocessed ${fixed} failed sources`);
}

main()
  .catch((error) => {
    console.error("reprocess failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

