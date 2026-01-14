import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying User-Company M:N Relation ---");

  // 1. Create two companies
  const company1 = await prisma.company.create({ data: { name: "Company A" } });
  const company2 = await prisma.company.create({ data: { name: "Company B" } });
  console.log(`Created companies: ${company1.name}, ${company2.name}`);

  // 2. Create a user linked to both companies
  const user = await prisma.user.create({
    data: {
      email: `multi_company_${Date.now()}@test.com`,
      password: "password",
      role: "EMPLOYEE",
      name: "Multi Company User",
      companies: {
        connect: [{ id: company1.id }, { id: company2.id }]
      }
    },
    include: {
      companies: true
    }
  });

  console.log(`Created user: ${user.name} (${user.email})`);
  console.log(`Linked companies count: ${user.companies.length}`);

  if (user.companies.length === 2) {
    console.log("PASS: User is linked to multiple companies.");
    user.companies.forEach(c => console.log(`  - ${c.name}`));
  } else {
    console.error("FAIL: User is NOT linked to multiple companies!");
  }

  // Clean up
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.company.delete({ where: { id: company1.id } });
  await prisma.company.delete({ where: { id: company2.id } });
  console.log("Cleanup complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
