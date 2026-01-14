import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Fixing Contract Dates ---");

  const contracts = await prisma.contract.findMany({
    where: { status: "ACTIVE" }
  });

  console.log(`Found ${contracts.length} active contracts.`);

  for (const contract of contracts) {
    const newStartDate = new Date(contract.startDate);
    newStartDate.setHours(0, 0, 0, 0);

    const newEndDate = new Date(contract.endDate);
    newEndDate.setHours(23, 59, 59, 999);

    if (newStartDate.getTime() !== contract.startDate.getTime() || newEndDate.getTime() !== contract.endDate.getTime()) {
      console.log(`Updating Contract ${contract.id}:`);
      console.log(`  Old Start: ${contract.startDate.toISOString()} -> New Start: ${newStartDate.toISOString()}`);
      console.log(`  Old End:   ${contract.endDate.toISOString()}   -> New End:   ${newEndDate.toISOString()}`);

      await prisma.contract.update({
        where: { id: contract.id },
        data: {
          startDate: newStartDate,
          endDate: newEndDate
        }
      });
    }
  }
  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
