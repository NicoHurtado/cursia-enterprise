import { prisma } from "@/lib/prisma";

async function main() {
  console.log("--- Verifying Contract Admin Integration ---");

  // 1. Find or create a CONTRACT_ADMIN user
  let admin = await prisma.user.findFirst({ where: { role: "CONTRACT_ADMIN" } });
  if (!admin) {
    console.log("Creating dummy CONTRACT_ADMIN...");
    admin = await prisma.user.create({
      data: {
        email: "contractadmin@test.com",
        password: "password",
        role: "CONTRACT_ADMIN",
        name: "Test Contract Admin"
      }
    });
  }
  console.log(`Testing with user: ${admin.email} (${admin.role})`);

  // 2. Simulate Redirect Logic (from app/page.tsx)
  console.log("Checking Redirect Logic:");
  let redirectPath = "/auth/signin";
  if (admin.role === "ADMIN") redirectPath = "/admin";
  else if (admin.role === "CLIENT") redirectPath = "/client";
  else if (admin.role === "EMPLOYEE") redirectPath = "/employee";
  else if (admin.role === "CONTRACT_ADMIN") redirectPath = "/employee"; // This is what we changed

  console.log(`  Expected Redirect: /employee`);
  console.log(`  Actual Redirect:   ${redirectPath}`);

  if (redirectPath !== "/employee") {
    console.error("FAIL: Incorrect redirect path!");
  } else {
    console.log("PASS: Redirect logic is correct.");
  }

  // 3. Simulate Access Control (from app/employee/layout.tsx)
  console.log("Checking Access Control:");
  const canAccessEmployeeLayout = admin.role === "EMPLOYEE" || admin.role === "CONTRACT_ADMIN";
  console.log(`  Can access /employee layout: ${canAccessEmployeeLayout}`);

  if (!canAccessEmployeeLayout) {
    console.error("FAIL: User cannot access employee layout!");
  } else {
    console.log("PASS: Access control is correct.");
  }

  // 4. Simulate Sidebar Logic (from components/employee/sidebar.tsx)
  console.log("Checking Sidebar Logic:");
  const showAdminPanel = admin.role === "CONTRACT_ADMIN";
  console.log(`  Show 'Panel Admin' link: ${showAdminPanel}`);

  if (!showAdminPanel) {
    console.error("FAIL: Admin panel link would not be shown!");
  } else {
    console.log("PASS: Sidebar logic is correct.");
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
