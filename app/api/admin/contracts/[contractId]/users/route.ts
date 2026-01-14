import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const assignUsersSchema = z.object({
  userIds: z.array(z.string()).optional(),
  preRegisteredUserIds: z.array(z.string()).optional(),
});

export async function POST(
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
    const body = assignUsersSchema.parse(json);

    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        courses: true,
        _count: { select: { users: true, preRegisteredUsers: true } }
      },
    });

    if (!contract) {
      return new NextResponse("Contract not found", { status: 404 });
    }

    const currentCount = (contract._count?.users || 0) + (contract._count?.preRegisteredUsers || 0);
    const newUsersCount = (body.userIds?.length || 0) + (body.preRegisteredUserIds?.length || 0);

    if (contract.maxUsers && contract.maxUsers > 0 && (currentCount + newUsersCount > contract.maxUsers)) {
      return new NextResponse(
        `El contrato ha alcanzado su límite de usuarios (${contract.maxUsers}). No se pueden agregar ${newUsersCount} usuarios más.`,
        { status: 400 }
      );
    }

    // Connect Users
    if (body.userIds && body.userIds.length > 0) {
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          users: {
            connect: body.userIds.map((id) => ({ id })),
          },
        },
      });

      // Create Enrollments for these users for all courses in contract
      for (const userId of body.userIds) {
        for (const course of contract.courses) {
          // Check if enrollment exists
          const exists = await prisma.enrollment.findUnique({
            where: {
              userId_courseId: {
                userId,
                courseId: course.id,
              },
            },
          });

          if (!exists) {
            await prisma.enrollment.create({
              data: {
                userId,
                courseId: course.id,
                companyId: contract.companyId,
                status: "NOT_STARTED",
              },
            });
          }
        }
      }
    }

    // Connect PreRegisteredUsers
    if (body.preRegisteredUserIds && body.preRegisteredUserIds.length > 0) {
      await prisma.contract.update({
        where: { id: contractId },
        data: {
          preRegisteredUsers: {
            connect: body.preRegisteredUserIds.map((id) => ({ id })),
          },
        },
      });

      // Also check if these pre-registered users are already registered users
      // If so, link the User account and create enrollments
      const preRegisteredUsers = await prisma.preRegisteredUser.findMany({
        where: { id: { in: body.preRegisteredUserIds } },
      });

      for (const preUser of preRegisteredUsers) {
        if (preUser.isRegistered || preUser.email) {
          const user = await prisma.user.findUnique({
            where: { email: preUser.email },
          });

          if (user) {
            // Link User to Contract
            await prisma.contract.update({
              where: { id: contractId },
              data: {
                users: {
                  connect: { id: user.id },
                },
              },
            });

            // Create Enrollments
            for (const course of contract.courses) {
              const exists = await prisma.enrollment.findUnique({
                where: {
                  userId_courseId: {
                    userId: user.id,
                    courseId: course.id,
                  },
                },
              });

              if (!exists) {
                await prisma.enrollment.create({
                  data: {
                    userId: user.id,
                    courseId: course.id,
                    companyId: contract.companyId,
                    status: "NOT_STARTED",
                  },
                });
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("Error assigning users:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
