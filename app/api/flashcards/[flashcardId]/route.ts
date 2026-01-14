import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const flashcardUpdateSchema = z.object({
  front: z.string().min(1).optional(),
  back: z.string().min(1).optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;
    const body = await req.json();
    const data = flashcardUpdateSchema.parse(body);

    const flashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        ...(data.front && { front: data.front }),
        ...(data.back && { back: data.back }),
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error updating flashcard:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;

    await prisma.flashcard.delete({
      where: { id: flashcardId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flashcard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

