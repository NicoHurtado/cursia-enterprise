import { PrismaClient } from "@prisma/client";

const databaseUrl = "postgresql://neondb_owner:npg_oJmxZA1Hgr0C@ep-morning-meadow-a4ige4s1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log("Explorando base de datos completa...");

  // Listar todas las tablas en el esquema public
  const tables: any[] = await prisma.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
  `;

  console.log("\nTablas encontradas:");
  for (const table of tables) {
    const count: any[] = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "${table.table_name}"`);
    console.log(`- ${table.table_name}: ${count[0].count} filas`);

    if (table.table_name === 'Course') {
      const samples = await prisma.$queryRawUnsafe(`SELECT title, "createdAt" FROM "Course" LIMIT 5`);
      console.log("  Muestras de Course:", JSON.stringify(samples, null, 2));
    }
  }

  // Listar otros esquemas por si acaso
  const schemas: any[] = await prisma.$queryRaw`
    SELECT schema_name FROM information_schema.schemata 
    WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
  `;
  console.log("\nEsquemas encontrados:", schemas.map(s => s.schema_name));
}

main()
  .catch(e => {
    console.error("Error:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
