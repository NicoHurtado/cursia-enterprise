import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Debugging Dashboard Data ---");

  // 1. List all Companies
  const companies = await prisma.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
          enrollments: true,
        }
      }
    }
  });

  console.log("\nCompanies found:", companies.length);
  companies.forEach(c => {
    console.log(`- Company: ${c.name} (${c.id})`);
    console.log(`  - Users (direct): ${c._count.users}`);
    console.log(`  - Enrollments: ${c._count.enrollments}`);
  });

  // 2. Check for Users with role EMPLOYEE
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: {
      companies: true,
      enrollments: true,
    },
    take: 5
  });

  console.log("\nSample Employees:", employees.length);
  employees.forEach(e => {
    console.log(`- Employee: ${e.email}`);
    console.log(`  - Companies: ${e.companies.map(c => c.name).join(", ")}`);
    console.log(`  - Enrollments: ${e.enrollments.length}`);
    e.enrollments.forEach(en => {
      console.log(`    - Enrollment in course ${en.courseId} for company ${en.companyId}`);
    });
  });

  // 3. Check for Client Admins
  const clients = await prisma.user.findMany({
    where: { role: "CLIENT" },
    include: {
      companies: true
    }
  });

  console.log("\nClient Admins:", clients.length);
  clients.forEach(c => {
    console.log(`- Client: ${c.email}`);
    console.log(`  - Companies: ${c.companies.map(co => co.name).join(", ")}`);
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
