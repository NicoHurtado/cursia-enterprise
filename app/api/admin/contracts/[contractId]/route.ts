import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ contractId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { contractId } = await params;

  try {
    await prisma.contract.delete({
      where: { id: contractId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting contract:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
