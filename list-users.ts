
import { prisma } from "./lib/prisma";

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: { email: true, role: true, name: true }
  });
  console.log("Users:", JSON.stringify(users, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
