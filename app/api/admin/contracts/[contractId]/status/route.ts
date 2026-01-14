import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "EXPIRED", "PENDING"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { contractId } = await params;

  try {
    const json = await req.json();
    const body = updateStatusSchema.parse(json);

    const contract = await prisma.contract.update({
      where: { id: contractId },
      data: { status: body.status },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Error updating contract status:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
