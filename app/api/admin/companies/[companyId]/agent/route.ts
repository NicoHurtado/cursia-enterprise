import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateAgentSchema = z.object({
  name: z.string().min(1).max(120),
  uiColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  isEnabled: z.boolean(),
  generalInstructions: z.string().max(3000).optional().nullable(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      agent: {
        select: {
          id: true,
          name: true,
          uiColor: true,
          isEnabled: true,
          generalInstructions: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!company) {
    return new NextResponse("Company not found", { status: 404 });
  }

  const agent =
    company.agent ||
    (await prisma.companyAgent.create({
      data: {
        companyId,
        name: `Agente ${company.name}`,
        uiColor: "#4f46e5",
        isEnabled: true,
      },
    }));

  return NextResponse.json(agent);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  try {
    const body = updateAgentSchema.parse(await req.json());
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return new NextResponse("Company not found", { status: 404 });
    }

    const agent = await prisma.companyAgent.upsert({
      where: { companyId },
      update: {
        name: body.name,
        uiColor: body.uiColor,
        isEnabled: body.isEnabled,
        generalInstructions: body.generalInstructions || null,
      },
      create: {
        companyId,
        name: body.name,
        uiColor: body.uiColor,
        isEnabled: body.isEnabled,
        generalInstructions: body.generalInstructions || null,
      },
    });

    return NextResponse.json(agent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ issues: error.issues }, { status: 400 });
    }
    console.error("Error updating company agent:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

