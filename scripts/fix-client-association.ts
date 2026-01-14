import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Fixing Client Association ---");

  const email = "nicola2s@gmail.com";
  const companyName = "Bancolombia";

  // 1. Find User
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`User ${email} not found.`);
    return;
  }

  // 2. Find Company
  const company = await prisma.company.findFirst({
    where: { name: companyName },
  });

  if (!company) {
    console.error(`Company ${companyName} not found.`);
    return;
  }

  // 3. Connect
  console.log(`Connecting ${user.email} to ${company.name}...`);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      companies: {
        connect: { id: company.id },
      },
    },
  });

  console.log("Success! User linked to company.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
