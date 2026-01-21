
import { prisma } from "./lib/prisma";

async function testConnection() {
  try {
    console.log("Testing connection...");
    const userCount = await prisma.user.count();
    console.log(`Connection successful. User count: ${userCount}`);
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:");
    console.error(error);
    process.exit(1);
  }
}

testConnection();
