import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const quizSchema = z.object({
  lessonId: z.string(),
  question: z.string().min(1),
  options: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean(),
    })
  ),
  explanation: z.string().optional().nullable(),
  order: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = quizSchema.parse(body);

    const quiz = await prisma.quiz.create({
      data: {
        lessonId: data.lessonId,
        question: data.question,
        options: data.options as any,
        explanation: data.explanation || null,
        order: data.order,
      },
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

