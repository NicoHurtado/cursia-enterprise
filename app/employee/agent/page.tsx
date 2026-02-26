import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyAgentChat } from "@/components/employee/company-agent-chat";
import { Card, CardContent } from "@/components/ui/card";

export default async function EmployeeSingleAgentPage() {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { companies: { select: { id: true } } },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const companyIds = user.companies.map((company) => company.id);
  if (session.user.companyId) {
    companyIds.push(session.user.companyId);
  }

  const agent = await prisma.companyAgent.findFirst({
    where: { companyId: { in: Array.from(new Set(companyIds)) } },
    orderBy: { createdAt: "asc" },
    include: { company: { select: { name: true } } },
  });

  if (!agent) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-14 text-center text-muted-foreground">
          Tu empresa aún no ha configurado un Agente IA.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <CompanyAgentChat
        agentId={agent.id}
        agentName={agent.name}
        companyName={agent.company.name}
        uiColor={agent.uiColor}
        isEnabled={agent.isEnabled}
      />
    </div>
  );
}

