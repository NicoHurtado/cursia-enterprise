import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Verificando usuario admin@cursia.com...\n");

  const adminEmail = "admin@cursia.com";

  // Buscar el usuario
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log("✅ Usuario encontrado:");
    console.log("   Email:", existingUser.email);
    console.log("   Nombre:", existingUser.name);
    console.log("   Role:", existingUser.role);
    console.log("   ID:", existingUser.id);
    console.log("\n✨ El usuario admin ya existe en la base de datos.");
    console.log("\n📝 Credenciales:");
    console.log("   Email: admin@cursia.com");
    console.log("   Password: admin123");
  } else {
    console.log("❌ Usuario NO encontrado. Creando...\n");

    const adminPassword = "admin123";
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Administrador Cursia",
        role: "ADMIN",
      },
    });

    console.log("✅ Usuario administrador creado exitosamente:");
    console.log("   Email:", newAdmin.email);
    console.log("   Nombre:", newAdmin.name);
    console.log("   Role:", newAdmin.role);
    console.log("   ID:", newAdmin.id);
    console.log("\n📝 Credenciales para login:");
    console.log("   Email: admin@cursia.com");
    console.log("   Password: admin123");
    console.log("\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login");
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
