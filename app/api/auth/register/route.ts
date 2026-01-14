import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = registerSchema.parse(json);

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return new NextResponse("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Check for pre-registration
    const preRegistered = await prisma.preRegisteredUser.findUnique({
      where: { email: body.email },
      include: { contracts: { include: { courses: true } } },
    });

    // Check for pending contract admin invites
    const pendingContracts = await prisma.contract.findMany({
      where: { adminEmail: body.email },
    });

    if (!preRegistered && pendingContracts.length === 0) {
      return new NextResponse(
        "No tienes permiso para registrarte. Contacta a tu administrador.",
        { status: 403 }
      );
    }

    let companyId = null;
    let role = "CLIENT"; // This might be overridden below
    let nationalId = null;
    let name = null;

    if (preRegistered) {
      companyId = preRegistered.companyId;
      role = "EMPLOYEE"; // Role for company employees
      nationalId = preRegistered.nationalId;
      name = preRegistered.name;
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: name,
        role: role as any,
        companies: companyId ? { connect: { id: companyId } } : undefined,
        nationalId: nationalId,
      },
    });

    // Check for pending contract admin invites (already fetched above)

    if (pendingContracts.length > 0) {
      role = "CONTRACT_ADMIN";
      // Update the user role immediately if we found contracts
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "CONTRACT_ADMIN" },
      });

      // Link user to these contracts
      await prisma.contract.updateMany({
        where: { adminEmail: body.email },
        data: { adminId: user.id },
      });
    }

    if (preRegistered) {
      // Connect User to Contracts
      if (preRegistered.contracts.length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            contracts: {
              connect: preRegistered.contracts.map((c) => ({ id: c.id })),
            },
          },
        });

        // Create Enrollments for all courses in these contracts
        for (const contract of preRegistered.contracts) {
          for (const course of contract.courses) {
            // Check if enrollment exists
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

      // Mark as registered
      await prisma.preRegisteredUser.update({
        where: { id: preRegistered.id },
        data: { isRegistered: true },
      });
    }

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }
    console.error("Registration error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
