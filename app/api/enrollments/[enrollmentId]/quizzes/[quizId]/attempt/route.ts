import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const quizAttemptSchema = z.object({
  score: z.number().min(0).max(100),
  answers: z.any(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string; quizId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId, quizId } = await params;
    const body = await req.json();
    const data = quizAttemptSchema.parse(body);

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: session.user.id,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    await prisma.quizAttempt.create({
      data: {
        enrollmentId,
        quizId,
        score: data.score,
        answers: data.answers,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

