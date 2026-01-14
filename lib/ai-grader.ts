import { Anthropic } from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GradingResult {
  score: number;
  feedback: string;
}

export async function gradeAnswer(
  question: string,
  studentAnswer: string,
  idealAnswer: string
): Promise<GradingResult> {
  try {
    const systemPrompt = `You are an expert AI grader for an educational platform.
Your task is to evaluate a student's answer to a specific question based on an ideal answer provided by the instructor.

Question: "${question}"
Ideal Answer / Criteria: "${idealAnswer}"

Student Answer: "${studentAnswer}"

Instructions:
1. Compare the student's answer to the ideal answer/criteria.
2. Assign a score from 0 to 100 based on accuracy, completeness, and understanding.
3. Provide brief, constructive feedback explaining the score and what was missing or well done.
4. Be fair but rigorous. Nonsense answers or answers unrelated to the question should receive 0.
5. Return ONLY a JSON object with the following format:
{
  "score": number,
  "feedback": "string"
}
Do not include any other text or markdown formatting outside the JSON.`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 500,
      messages: [{ role: "user", content: "Grade this answer." }],
      system: systemPrompt,
    });

    const text = (response.content[0] as any).text;

    // Clean up potential markdown code blocks if the model adds them
    const jsonString = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("AI Grading Error:", error);
    // Fallback in case of AI failure
    return {
      score: 0,
      feedback: "Error al calificar automáticamente. Se requiere revisión manual.",
    };
  }
}
