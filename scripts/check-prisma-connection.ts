import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.company.count();
  console.log(`company_count=${count}`);
}

main()
  .catch((error) => {
    console.error("prisma_check_failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

