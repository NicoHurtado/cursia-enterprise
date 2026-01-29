import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@cursia.com";
  const testPassword = "admin123";

  console.log("🔐 Verificando credenciales de admin@cursia.com...\n");

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email },
    include: { companies: true },
  });

  if (!user) {
    console.log("❌ Usuario NO encontrado en la base de datos");
    console.log("\n💡 Ejecuta: npx tsx scripts/init-db.ts");
    return;
  }

  console.log("✅ Usuario encontrado:");
  console.log("   Email:", user.email);
  console.log("   Nombre:", user.name);
  console.log("   Role:", user.role);
  console.log("   ID:", user.id);
  console.log("   Empresas asociadas:", user.companies.length);

  // Verificar password
  console.log("\n🔑 Verificando contraseña...");
  const isPasswordValid = await bcrypt.compare(testPassword, user.password);

  if (isPasswordValid) {
    console.log("✅ ¡Contraseña correcta!");
    console.log("\n📝 Credenciales válidas:");
    console.log("   Email: admin@cursia.com");
    console.log("   Password: admin123");
    console.log("\n✨ Deberías poder iniciar sesión sin problemas.");
  } else {
    console.log("❌ Contraseña incorrecta");
    console.log("\n🔧 Reestableciendo contraseña a 'admin123'...");

    const newHashedPassword = await bcrypt.hash(testPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: newHashedPassword },
    });

    console.log("✅ Contraseña reestablecida exitosamente");
    console.log("\n📝 Nuevas credenciales:");
    console.log("   Email: admin@cursia.com");
    console.log("   Password: admin123");
  }

  // Mostrar hash para debug
  console.log("\n🔍 Debug info:");
  console.log("   Hash length:", user.password.length);
  console.log("   Hash starts with $2:", user.password.startsWith("$2"));
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
