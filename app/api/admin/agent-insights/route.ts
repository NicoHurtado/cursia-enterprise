import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAgentInsights } from "@/lib/agents/admin-insights";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const daysParam = Number(searchParams.get("days") || "30");
  const agentId = searchParams.get("agentId") || undefined;
  const companyId = searchParams.get("companyId") || undefined;

  try {
    const data = await getAgentInsights({
      days: Number.isFinite(daysParam) ? daysParam : 30,
      agentId,
      companyId,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("Agent insights API error:", error);
    return NextResponse.json(
      { message: "No se pudo cargar la analítica del agente." },
      { status: 500 }
    );
  }
}

