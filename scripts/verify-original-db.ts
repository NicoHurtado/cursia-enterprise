import { PrismaClient } from "@prisma/client";

// URL provided by the user
const databaseUrl = "postgresql://neondb_owner:npg_oJmxZA1Hgr0C@ep-morning-meadow-a4ige4s1-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
});

async function main() {
  console.log("Checking database:", databaseUrl);
  const courses = await prisma.course.findMany({
    select: {
      id: true,
      title: true,
      createdAt: true
    }
  });
  console.log("Total courses found:", courses.length);
  console.log(JSON.stringify(courses, null, 2));
}

main()
  .catch(e => {
    console.error("Error connecting to database:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
