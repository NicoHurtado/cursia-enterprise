import { prisma } from "./lib/prisma";
import { ingestAgentSource } from "./lib/agents/ingestion";
import fs from "fs";

async function main() {
  console.log("Searching for Test company...");
  let company = await prisma.company.findFirst({ where: { name: "Test" } });
  if (!company) {
    company = await prisma.company.findFirst();
  }
  if (!company) throw new Error("No company found");

  console.log(`Using company: ${company.name}`);

  let agent = await prisma.companyAgent.findUnique({ where: { companyId: company.id } });
  if (!agent) {
    agent = await prisma.companyAgent.create({
      data: {
        companyId: company.id,
        name: `Agente ${company.name}`,
        uiColor: "#4f46e5",
        isEnabled: true,
      }
    });
  }

  const rawText = fs.readFileSync("C:\\temp\\manual_prueba_ai.txt", "utf-8");

  console.log("Starting ingestion process...");
  const source = await ingestAgentSource({
    agentId: agent.id,
    title: "manual_prueba_ai.txt",
    sourceType: "TEXT",
    rawText: rawText,
  });

  console.log("Ingestion complete!");
  console.log(JSON.stringify(source, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
