import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public route - no auth required
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const assessment = await prisma.freeAssessment.findUnique({
      where: { id, isActive: true },
      select: {
        id: true,
        title: true,
        description: true,
        passingScore: true,
        timeLimit: true,
        questions: true,
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Strip idealAnswer from questions for public access
    const questions = assessment.questions as Array<{ question: string; idealAnswer: string }>;
    const publicQuestions = questions.map((q) => ({
      question: q.question,
    }));

    return NextResponse.json({
      ...assessment,
      questions: publicQuestions,
      questionCount: questions.length,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
