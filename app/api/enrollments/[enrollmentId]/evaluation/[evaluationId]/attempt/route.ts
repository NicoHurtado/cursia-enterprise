import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string; evaluationId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId, evaluationId } = await params;
    const { answers } = await req.json();

    // 1. Fetch the evaluation with ideal answers
    const evaluation = await prisma.finalEvaluation.findUnique({
      where: { id: evaluationId },
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    const questions = evaluation.questions as Array<{
      question: string;
      idealAnswer: string;
    }>;

    // 2. Construct prompt for AI Grading
    let prompt = `You are a strict but fair academic grader. 
Your task is to evaluate a student's answers to an open-ended exam.
For each question, compare the Student Answer with the Ideal Answer.

Here are the questions and answers:

`;

    questions.forEach((q, index) => {
      const studentAnswer = answers[index] || "No answer provided.";
      prompt += `
Question ${index + 1}: ${q.question}
Ideal Answer: ${q.idealAnswer}
Student Answer: ${studentAnswer}
-----------------------------------
`;
    });

    prompt += `
Provide your output as a valid JSON object with the following structure:
{
  "questionResults": [
    {
      "questionIndex": number,
      "score": number (0-100),
      "feedback": "Brief feedback explaining the score"
    }
  ],
  "overallFeedback": "Overall summary of the student's performance",
  "overallScore": number (average of question scores)
}

Do not include any markdown formatting or explanation outside the JSON. Just the JSON string.`;

    // 3. Call AI
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponseText = (response.content[0] as any).text;

    // Clean up response if it contains markdown code blocks
    const cleanJson = aiResponseText.replace(/```json\n?|\n?```/g, "").trim();

    let gradingResult;
    try {
      gradingResult = JSON.parse(cleanJson);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponseText);
      return NextResponse.json({ error: "Grading failed" }, { status: 500 });
    }

    const finalScore = Math.round(gradingResult.overallScore);
    const passed = finalScore >= evaluation.passingScore;

    // 4. Save Attempt
    const attempt = await prisma.evaluationAttempt.create({
      data: {
        enrollmentId,
        evaluationId,
        score: finalScore,
        passed,
        answers: {
          rawAnswers: answers,
          grading: gradingResult,
        },
      },
    });

    return NextResponse.json({
      score: finalScore,
      passed,
      feedback: gradingResult.overallFeedback,
      details: gradingResult.questionResults,
    });

  } catch (error) {
    console.error("Error submitting evaluation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
