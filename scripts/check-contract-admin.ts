import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Checking Contract Admin Status ---");

  const client = await prisma.user.findUnique({
    where: { email: "nicola2s@gmail.com" },
    include: {
      managedContracts: {
        include: { company: true }
      }
    }
  });

  if (client) {
    console.log(`Client: ${client.email}`);
    console.log(`Managed Contracts: ${client.managedContracts.length}`);
    client.managedContracts.forEach(c => {
      console.log(` - Contract for: ${c.company.name} (${c.company.id})`);
    });
  } else {
    console.log("Client not found");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
