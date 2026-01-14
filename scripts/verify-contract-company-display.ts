import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying Company Display from Contracts ---");

  // 1. Create a company
  const company = await prisma.company.create({ data: { name: "Contract Company" } });

  // 2. Create a user (no direct company link)
  const user = await prisma.user.create({
    data: {
      email: `contract_user_${Date.now()}@test.com`,
      password: "password",
      role: "EMPLOYEE",
      name: "Contract User",
    }
  });

  // 3. Create an active contract linking user and company
  // Note: Contract model has users User[] relation
  const contract = await prisma.contract.create({
    data: {
      companyId: company.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 10000000),
      status: "ACTIVE",
      users: { connect: { id: user.id } }
    }
  });

  console.log(`Created User: ${user.email}`);
  console.log(`Created Company: ${company.name}`);
  console.log(`Created Active Contract: ${contract.id}`);

  // 4. Simulate the query from admin users page
  const fetchedUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      companies: true,
      contracts: {
        where: { status: "ACTIVE" },
        include: { company: true },
      },
    },
  });

  if (!fetchedUser) throw new Error("User not found");

  // 5. Calculate displayed companies
  const allCompanies = [
    ...fetchedUser.companies,
    ...fetchedUser.contracts.map((c) => c.company),
  ];
  const uniqueCompanies = Array.from(
    new Map(allCompanies.map((c) => [c.id, c])).values()
  );

  console.log(`Direct Companies: ${fetchedUser.companies.length}`);
  console.log(`Contract Companies: ${fetchedUser.contracts.length}`);
  console.log(`Displayed Companies: ${uniqueCompanies.length}`);

  if (uniqueCompanies.length === 1 && uniqueCompanies[0].name === "Contract Company") {
    console.log("PASS: User correctly shows company from active contract.");
  } else {
    console.error("FAIL: Incorrect company display.");
    console.log("Found companies:", uniqueCompanies.map(c => c.name));
  }

  // Cleanup
  await prisma.contract.delete({ where: { id: contract.id } });
  await prisma.user.delete({ where: { id: user.id } });
  await prisma.company.delete({ where: { id: company.id } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
