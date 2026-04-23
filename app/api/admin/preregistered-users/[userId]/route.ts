import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { userId } = await params;
  const body = await req.json();
  const { name, email, nationalId } = body;

  try {
    const preReg = await prisma.preRegisteredUser.findUnique({
      where: { id: userId },
    });

    if (!preReg) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const updated = await prisma.preRegisteredUser.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(email !== undefined && { email }),
        ...(nationalId !== undefined && { nationalId: nationalId || null }),
      },
    });

    // If the user has already registered, also update their User record
    // so the certificate reflects the change immediately
    if (preReg.isRegistered) {
      const registeredUser = await prisma.user.findFirst({
        where: { email: preReg.email },
      });

      if (registeredUser) {
        await prisma.user.update({
          where: { id: registeredUser.id },
          data: {
            ...(name !== undefined && { name: name || null }),
            ...(nationalId !== undefined && { nationalId: nationalId || null }),
            ...(email !== undefined && email !== preReg.email && { email }),
          },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo" },
        { status: 409 }
      );
    }
    console.error("Error updating pre-registered user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { userId } = await params;

  try {
    await prisma.preRegisteredUser.delete({
      where: { id: userId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting pre-registered user:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
