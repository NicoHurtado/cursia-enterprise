import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const contractSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(["ACTIVE", "EXPIRED", "PENDING"]).optional(),
  documentUrl: z.string().optional(),
  courseIds: z.array(z.string()).optional(),
  adminEmail: z.string().email().optional(),
  maxUsers: z.coerce.number().min(0).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  try {
    const body = await req.json();
    const result = contractSchema.safeParse(body);

    if (!result.success) {
      return new NextResponse(JSON.stringify(result.error.issues), { status: 400 });
    }

    const { startDate, endDate, status, documentUrl, courseIds, adminEmail, maxUsers } = result.data;

    // Normalize dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    let adminId: string | undefined;

    if (adminEmail) {
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail },
      });
      if (adminUser) {
        adminId = adminUser.id;
        if (adminUser.role === "EMPLOYEE" || adminUser.role === "CLIENT") {
          await prisma.user.update({
            where: { id: adminUser.id },
            data: { role: "CONTRACT_ADMIN" }
          });
        }
      }
    }

    const contract = await prisma.contract.create({
      data: {
        companyId,
        startDate,
        endDate,
        status: status || "ACTIVE",
        documentUrl,
        maxUsers: maxUsers || 0,
        adminId,
        adminEmail,
        courses: courseIds
          ? {
            connect: courseIds.map((id) => ({ id })),
          }
          : undefined,
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("Error creating contract:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
