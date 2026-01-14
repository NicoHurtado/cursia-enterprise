import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  try {
    // Delete company (cascade will handle related data if configured, otherwise we might need manual cleanup)
    // Prisma schema has onDelete: Cascade for most relations, so this should be safe.
    await prisma.company.delete({
      where: { id: companyId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting company:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
