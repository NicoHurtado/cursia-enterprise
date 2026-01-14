import { prisma } from "./lib/prisma";

async function main() {
  const email = "pedrosaldafo@gmail.com";
  const user = await prisma.user.findUnique({
    where: { email },
    include: { companies: true, contracts: true, enrollments: true },
  });
  console.log("User:", JSON.stringify(user, null, 2));

  const preReg = await prisma.preRegisteredUser.findUnique({
    where: { email },
  });
  console.log("PreRegistered:", JSON.stringify(preReg, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
