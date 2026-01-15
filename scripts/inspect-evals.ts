
import { PrismaClient } from "@prisma/client";
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.evaluationAttempt.findMany({
    take: 5,
    orderBy: { completedAt: 'desc' },
  });

  fs.writeFileSync('scripts/eval_dump.json', JSON.stringify(attempts, null, 2));
  console.log("Dumped to scripts/eval_dump.json");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
