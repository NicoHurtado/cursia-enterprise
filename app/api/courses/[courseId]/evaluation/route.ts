import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const evaluationSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      idealAnswer: z.string(),
    })
  ),
  passingScore: z.number().min(0).max(100),
  timeLimit: z.number().min(1).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await params;
    const body = await req.json();
    const data = evaluationSchema.parse(body);

    console.log("DEBUG: Saving evaluation for course:", courseId);
    console.log("DEBUG: Payload:", JSON.stringify(data, null, 2));

    const evaluation = await prisma.finalEvaluation.upsert({
      where: { courseId },
      create: {
        courseId,
        questions: data.questions as any,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
      },
      update: {
        questions: data.questions as any,
        passingScore: data.passingScore,
        timeLimit: data.timeLimit,
      },
    });

    console.log("DEBUG: Saved evaluation:", evaluation);

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error saving evaluation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

