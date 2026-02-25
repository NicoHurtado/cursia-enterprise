import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function EmployeeAgentSourcePreviewPage({
  params,
}: {
  params: Promise<{ agentId: string; sourceId: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const allowedRoles = ["EMPLOYEE", "CONTRACT_ADMIN", "CLIENT"];
  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  const { agentId, sourceId } = await params;
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

  const source = await prisma.agentSourceDocument.findFirst({
    where: {
      id: sourceId,
      status: "READY",
      agentId,
      agent: { companyId: { in: Array.from(new Set(companyIds)) } },
    },
    select: {
      id: true,
      title: true,
      rawText: true,
      mimeType: true,
      filePath: true,
      agent: { select: { id: true, name: true } },
    },
  });

  if (!source) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{source.title}</h1>
          <p className="text-sm text-muted-foreground">
            Fuente de {source.agent.name}
            {source.mimeType ? ` · ${source.mimeType}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/employee/agents/${source.agent.id}`}
            className="px-3 py-2 rounded-md border text-sm hover:bg-muted"
          >
            Volver al chat
          </Link>
          {source.filePath && (
            <a
              href={source.filePath}
              className="px-3 py-2 rounded-md border text-sm hover:bg-muted"
            >
              Descargar original
            </a>
          )}
        </div>
      </div>

      <article className="rounded-lg border bg-card p-4">
        <pre className="whitespace-pre-wrap break-words text-sm leading-6 font-sans">
          {source.rawText || "Este documento no contiene texto extraido para vista previa."}
        </pre>
      </article>
    </div>
  );
}
