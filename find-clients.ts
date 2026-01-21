
import { prisma } from "./lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    select: { email: true, role: true, name: true }
  });
  console.log("Client Users:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
