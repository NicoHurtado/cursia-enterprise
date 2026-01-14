import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying Client Admin Companies ---");

  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: { companies: true }
  });

  clients.forEach(c => {
    console.log(`Client: ${c.email}`);
    console.log(`Companies: ${c.companies.length}`);
    c.companies.forEach(co => console.log(` - ${co.name} (${co.id})`));
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
