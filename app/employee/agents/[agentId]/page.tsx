import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyAgentChat } from "@/components/employee/company-agent-chat";

export default async function EmployeeAgentPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  const { agentId } = await params;

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
    where: {
      id: agentId,
      companyId: { in: Array.from(new Set(companyIds)) },
    },
    include: {
      _count: { select: { sourceDocuments: true } },
      company: { select: { name: true } },
    },
  });

  if (!agent) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold">{agent.name}</h1>
        <p className="text-muted-foreground">
          Empresa: {agent.company.name} · {agent._count.sourceDocuments} fuentes disponibles
        </p>
      </div>
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

