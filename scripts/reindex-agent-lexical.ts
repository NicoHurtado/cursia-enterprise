import { PrismaClient } from "@prisma/client";
import { buildLexicalVector } from "../lib/agents/retrieval";

const prisma = new PrismaClient();

async function main() {
  const chunks = await prisma.agentChunk.findMany({
    select: { id: true, content: true },
  });

  let updated = 0;
  for (const chunk of chunks) {
    await prisma.agentChunk.update({
      where: { id: chunk.id },
      data: { lexicalVector: buildLexicalVector(chunk.content) },
    });
    updated += 1;
  }

  console.log(`reindexed ${updated} chunks`);
}

main()
  .catch((error) => {
    console.error("reindex failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

