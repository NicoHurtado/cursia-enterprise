import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@cursia.com" },
    update: {
      password: hashedPassword,
      role: "ADMIN",
    },
    create: {
      email: "admin@cursia.com",
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user reset successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
