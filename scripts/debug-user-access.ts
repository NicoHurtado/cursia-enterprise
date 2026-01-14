import { prisma } from "@/lib/prisma";

async function main() {
  const email = "nicolas@gmail.com";
  console.log(`--- Debugging access for ${email} ---`);

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      enrollments: true,
      contracts: { include: { courses: true } },
    }
  });

  if (!user) {
    console.log("User not found in database.");
  } else {
    console.log("User found:", { id: user.id, role: user.role });
    console.log("Direct Contracts:", user.contracts.length);
    user.contracts.forEach(c => {
      console.log(`- Contract ${c.id}:`);
      console.log(`  Status: ${c.status}`);
      console.log(`  Start: ${c.startDate.toISOString()} (Now >= Start: ${new Date() >= c.startDate})`);
      console.log(`  End:   ${c.endDate.toISOString()} (Now <= End: ${new Date() <= c.endDate})`);
      console.log(`  Courses: ${c.courses.map(co => co.title).join(", ")}`);
    });
    console.log("Enrollments:", user.enrollments.length);
    user.enrollments.forEach(e => {
      console.log(`- Enrollment ${e.id}: CourseId=${e.courseId}, Status=${e.status}`);
    });
  }

  const preUser = await prisma.preRegisteredUser.findUnique({
    where: { email },
    include: { contracts: { include: { courses: true } } }
  });

  if (!preUser) {
    console.log("PreRegisteredUser not found.");
  } else {
    console.log("PreRegisteredUser found:", { id: preUser.id, isRegistered: preUser.isRegistered });
    console.log("PreReg Contracts:", preUser.contracts.length);
    preUser.contracts.forEach(c => {
      console.log(`- Contract ${c.id}: Status=${c.status}, Start=${c.startDate}, End=${c.endDate}`);
      console.log(`  Courses: ${c.courses.map(co => co.title).join(", ")}`);
    });
  }

  // Check logic query
  if (user) {
    const activeContracts = await prisma.contract.findMany({
      where: {
        OR: [
          { users: { some: { id: user.id } } },
          { preRegisteredUsers: { some: { email: user.email } } },
        ],
        status: "ACTIVE",
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      include: { courses: { select: { id: true, title: true } } },
    });
    console.log("--- Active Contracts Query Result ---");
    console.log("Active Contracts Count:", activeContracts.length);
    activeContracts.forEach(c => {
      console.log(`- Contract ${c.id} is ACTIVE and Valid. Courses: ${c.courses.map(co => co.title).join(", ")}`);
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
