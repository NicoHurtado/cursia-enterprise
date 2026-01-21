
import { prisma } from "./lib/prisma";

async function main() {
  console.log("--- Verifying Contract Data for Admins ---");

  const users = await prisma.user.findMany({
    where: { role: { in: ['CLIENT', 'CONTRACT_ADMIN'] } },
    include: {
      managedContracts: {
        include: { company: true }
      }
    }
  });

  users.forEach(user => {
    console.log(`User: ${user.email} (${user.role})`);
    if (user.managedContracts.length > 0) {
      user.managedContracts.forEach(c => {
        console.log(`  - Managed Contract for Company: ${c.company.name}`);
      });
    } else {
      console.log("  - No managed contracts found.");
    }
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
