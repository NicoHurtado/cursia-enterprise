import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying Certificate Data Fetching ---");

  // 1. Get a user with a company
  let user = await prisma.user.findFirst({
    where: { companyId: { not: null } },
    include: { company: true }
  });

  if (!user) {
    console.log("No user with company found, creating one...");
    const company = await prisma.company.create({ data: { name: "Test Company" } });
    user = await prisma.user.create({
      data: {
        email: "cert_test@test.com",
        password: "password",
        role: "EMPLOYEE",
        name: "Cert Test User",
        companyId: company.id
      },
      include: { company: true }
    });
  }

  // Get a course for this company
  let course = await prisma.course.findFirst({ where: { companyId: user.companyId } });
  if (!course) {
    console.log("No course found, creating one...");
    course = await prisma.course.create({
      data: {
        title: "Certificate Test Course",
        creatorId: user.id,
        companyId: user.companyId
      }
    });
  }

  console.log(`User: ${user.name} (${user.email})`);
  console.log(`Course: ${course.title}`);

  // 2. Ensure enrollment exists and is completed
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
    create: {
      userId: user.id,
      courseId: course.id,
      companyId: user.companyId!,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  console.log("Enrollment marked as COMPLETED.");

  // 3. Simulate Fetch Logic (from app/employee/certificates/page.tsx)
  const completedEnrollments = await prisma.enrollment.findMany({
    where: {
      userId: user.id,
      status: "COMPLETED",
    },
    include: {
      course: true,
      company: true,
      user: true,
    },
  });

  console.log(`Found ${completedEnrollments.length} completed enrollments.`);

  const targetEnrollment = completedEnrollments.find(e => e.id === enrollment.id);
  if (!targetEnrollment) {
    console.error("FAIL: Could not find the completed enrollment!");
  } else {
    console.log("PASS: Found completed enrollment.");
    console.log("Data for Certificate:");
    console.log(`  Student Name: ${targetEnrollment.user.name}`);
    console.log(`  Student ID: ${targetEnrollment.user.nationalId}`);
    console.log(`  Course Name: ${targetEnrollment.course.title}`);
    console.log(`  Company Name: ${targetEnrollment.company.name}`);
    console.log(`  Completion Date: ${targetEnrollment.completedAt}`);
  }

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
