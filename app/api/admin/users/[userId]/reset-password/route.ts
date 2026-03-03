import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

function generatePassword(length = 8): string {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; // Sin i,l,o,0,1 para evitar confusión
  let result = "";
  const bytes = randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i]! % chars.length];
  }
  return result;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        contracts: {
          where: { status: "ACTIVE" },
          select: { adminId: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // ADMIN puede resetear a cualquiera. CONTRACT_ADMIN/CLIENT solo a usuarios de sus contratos.
    const role = session.user.role as string;
    if (role === "ADMIN") {
      // OK
    } else if (role === "CONTRACT_ADMIN" || role === "CLIENT") {
      const isInManagedContract = targetUser.contracts.some(
        (c) => c.adminId === session.user.id
      );
      if (!isInManagedContract) {
        return NextResponse.json({ error: "No tienes permiso para resetear este usuario" }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const newPassword = generatePassword(8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      password: newPassword,
      email: targetUser.email,
      name: targetUser.name,
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
