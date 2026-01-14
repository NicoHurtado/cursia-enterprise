import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { gradeAnswer } from "@/lib/ai-grader";

const submissionSchema = z.object({
  answers: z.record(z.string()),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId } = await params;
    const body = await req.json();
    const { answers } = submissionSchema.parse(body);

    // Fetch enrollment and course evaluation
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            finalEvaluation: true,
          },
        },
      },
    });

    if (!enrollment || !enrollment.course.finalEvaluation) {
      return NextResponse.json(
        { error: "Evaluation not found" },
        { status: 404 }
      );
    }

    // AI Grading Logic
    const questions = enrollment.course.finalEvaluation.questions as any[];
    let totalScore = 0;
    const maxScore = 100;
    const scorePerQuestion = maxScore / questions.length;

    // Grade each question in parallel
    const gradingPromises = questions.map(async (q, index) => {
      const studentAnswer = answers[index.toString()] || "";
      const result = await gradeAnswer(q.question, studentAnswer, q.idealAnswer);

      // Weighted score: (AI Score / 100) * Score Worth of this question
      const weightedScore = (result.score / 100) * scorePerQuestion;

      return {
        questionId: index,
        studentAnswer,
        aiScore: result.score,
        weightedScore,
        feedback: result.feedback
      };
    });

    const gradedResults = await Promise.all(gradingPromises);

    // Calculate total
    totalScore = gradedResults.reduce((acc, curr) => acc + curr.weightedScore, 0);
    const finalScore = Math.round(totalScore);
    const passed = finalScore >= enrollment.course.finalEvaluation.passingScore;

    // Save attempt with detailed feedback
    const attempt = await prisma.evaluationAttempt.create({
      data: {
        enrollmentId,
        evaluationId: enrollment.course.finalEvaluation.id,
        score: finalScore,
        passed,
        answers: {
          rawAnswers: answers,
          gradingDetails: gradedResults
        } as any,
      },
    });

    // If passed, mark course as completed? 
    // (Optional: depends on business logic, usually done if all requirements met)
    if (passed) {
      await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
        }
      });
    }

    return NextResponse.json({
      score: finalScore,
      passed,
      attemptId: attempt.id,
    });

  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
