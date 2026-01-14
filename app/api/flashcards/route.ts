import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const flashcardSchema = z.object({
  lessonId: z.string(),
  front: z.string().min(1),
  back: z.string().min(1),
  order: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = flashcardSchema.parse(body);

    const flashcard = await prisma.flashcard.create({
      data: {
        lessonId: data.lessonId,
        front: data.front,
        back: data.back,
        order: data.order,
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("Error creating flashcard:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

