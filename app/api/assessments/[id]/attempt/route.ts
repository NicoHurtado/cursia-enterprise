import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Public route - no auth required
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { answers, participantName } = await req.json();

    if (!participantName || !participantName.trim()) {
      return NextResponse.json(
        { error: "Participant name is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the assessment with ideal answers
    const assessment = await prisma.freeAssessment.findUnique({
      where: { id, isActive: true },
    });

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const questions = assessment.questions as Array<{
      question: string;
      idealAnswer: string;
    }>;

    // 2. Construct prompt for AI Grading
    let prompt = `Eres un evaluador. Compara la respuesta del participante con la respuesta ideal.

Escala:
- 100% = la respuesta cubre completamente el concepto de la respuesta ideal (sin importar orden, redacción u ortografía)
- 40-90% = cubre parcialmente el concepto
- 0% = no tiene nada que ver con la respuesta ideal

Preguntas:
`;

    questions.forEach((q, index) => {
      const studentAnswer = answers[index] || "Sin respuesta.";
      prompt += `
Pregunta ${index + 1}: ${q.question}
Respuesta ideal: ${q.idealAnswer}
Respuesta del participante: ${studentAnswer}
---
`;
    });

    prompt += `
Responde SOLO con un JSON válido, sin markdown ni explicaciones:
{
  "questionResults": [
    {
      "questionIndex": 0,
      "score": 0-100,
      "feedback": "Breve explicación de la calificación"
    }
  ],
  "overallFeedback": "Resumen general del desempeño"
}`;

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

    // 4. Calculate score SERVER-SIDE (don't trust AI's math)
    const questionScores = gradingResult.questionResults.map((r: any) => r.score as number);
    const finalScore = questionScores.length > 0
      ? Math.round(questionScores.reduce((sum: number, s: number) => sum + s, 0) / questionScores.length)
      : 0;
    const passed = finalScore >= assessment.passingScore;

    // 4. Save Attempt
    const attempt = await prisma.freeAssessmentAttempt.create({
      data: {
        assessmentId: id,
        participantName: participantName.trim(),
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
      passingScore: assessment.passingScore,
    });
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
