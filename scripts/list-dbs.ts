import { PrismaClient } from "@prisma/client";

const databaseUrl = "postgresql://neondb_owner:npg_oJmxZA1Hgr0C@ep-morning-meadow-a4ige4s1-pooler.us-east-1.aws.neon.tech/postgres?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log("Listando todas las bases de datos...");
  const dbs: any[] = await prisma.$queryRaw`SELECT datname FROM pg_database WHERE datistemplate = false;`;
  console.log("Bases de datos encontradas:", dbs.map(d => d.datname));
}

main()
  .catch(e => {
    console.error("Error:", e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
