import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying Delete Functionality ---");

  // 1. Create dummy company
  const company = await prisma.company.create({
    data: { name: "Delete Test Company" }
  });
  console.log(`Created Company: ${company.id}`);

  // Get an admin user for course creation
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No admin user found");

  // 2. Create dummy course
  const course = await prisma.course.create({
    data: {
      title: "Delete Test Course",
      creatorId: admin.id,
      companyId: company.id
    }
  });
  console.log(`Created Course: ${course.id}`);

  // 3. Create dummy user
  const user = await prisma.user.create({
    data: {
      email: "deletetest@example.com",
      password: "password",
      role: "EMPLOYEE",
      companyId: company.id
    }
  });
  console.log(`Created User: ${user.id}`);

  // 4. Create dummy contract
  const contract = await prisma.contract.create({
    data: {
      companyId: company.id,
      startDate: new Date(),
      endDate: new Date(),
      status: "ACTIVE"
    }
  });
  console.log(`Created Contract: ${contract.id}`);

  // 5. Create dummy pre-registered user
  const preUser = await prisma.preRegisteredUser.create({
    data: {
      email: "predelete@example.com",
      companyId: company.id
    }
  });
  console.log(`Created PreRegisteredUser: ${preUser.id}`);


  // --- DELETE OPERATIONS ---

  // Delete PreRegisteredUser
  console.log("Deleting PreRegisteredUser...");
  await prisma.preRegisteredUser.delete({ where: { id: preUser.id } });
  const checkPreUser = await prisma.preRegisteredUser.findUnique({ where: { id: preUser.id } });
  console.log(`PreRegisteredUser deleted: ${checkPreUser === null}`);

  // Delete Contract
  console.log("Deleting Contract...");
  await prisma.contract.delete({ where: { id: contract.id } });
  const checkContract = await prisma.contract.findUnique({ where: { id: contract.id } });
  console.log(`Contract deleted: ${checkContract === null}`);

  // Delete User
  console.log("Deleting User...");
  await prisma.user.delete({ where: { id: user.id } });
  const checkUser = await prisma.user.findUnique({ where: { id: user.id } });
  console.log(`User deleted: ${checkUser === null}`);

  // Delete Course
  console.log("Deleting Course...");
  await prisma.course.delete({ where: { id: course.id } });
  const checkCourse = await prisma.course.findUnique({ where: { id: course.id } });
  console.log(`Course deleted: ${checkCourse === null}`);

  // Delete Company
  console.log("Deleting Company...");
  await prisma.company.delete({ where: { id: company.id } });
  const checkCompany = await prisma.company.findUnique({ where: { id: company.id } });
  console.log(`Company deleted: ${checkCompany === null}`);

  console.log("--- Verification Complete ---");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
