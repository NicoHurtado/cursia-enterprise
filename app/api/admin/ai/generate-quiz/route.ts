import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { lessonId, numQuestions = 3, additionalInstructions } = await req.json();

    if (!lessonId) {
      return new NextResponse("Missing lessonId", { status: 400 });
    }

    // 1. Fetch Lesson Context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    const course = lesson.module.course;
    const currentModule = lesson.module;

    // 2. Construct Prompt
    const prompt = `
You are an expert educational content creator. Your task is to generate a quiz for a specific lesson in an online course.

**Course Details:**
- Title: ${course.title}
- Description: ${course.description || "N/A"}

**Module:**
- Title: ${currentModule.title}

**Lesson:**
- Title: ${lesson.title}
- Content:
${lesson.content || "No content provided yet."}

**Instructions:**
1.  Generate ${numQuestions} multiple-choice questions based strictly on the lesson content provided above.
2.  **Format:** Return a JSON array of objects. Each object must have:
    - \`question\`: The question text (string).
    - \`options\`: An array of exactly 4 objects, each with:
        - \`text\`: The option text (string).
        - \`isCorrect\`: Boolean (true for the correct answer, false otherwise).
    - \`explanation\`: A brief explanation of why the correct answer is correct (string).
3.  **Difficulty:** Mixed (some easy, some medium, some hard).
4.  **Language:** Spanish (or match the content language).
5.  **Output:** Return ONLY the valid JSON array. Do not include markdown formatting like \`\`\`json or any conversational text.
6.  **IMPORTANT:** Ensure all double quotes *inside* strings are properly escaped (e.g., \\"). If you need to use quotes inside the text, prefer single quotes (') to avoid JSON errors. Ensure the JSON is valid and parsable.

${additionalInstructions ? `**Additional Instructions:**\n${additionalInstructions}` : ""}
    `.trim();

    // 3. Call Anthropic API
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    // 4. Parse JSON
    let jsonString = (message.content[0] as any).text;

    // Attempt to extract the JSON array from the text
    const startIndex = jsonString.indexOf('[');
    const endIndex = jsonString.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1) {
      jsonString = jsonString.substring(startIndex, endIndex + 1);
    }

    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (e) {
      console.error("Initial JSON parse failed. Attempting to sanitize...", e);
      try {
        // 1. naive sanitization: Replace " inside strings? Hard to know boundaries.
        // 2. better: Ask model to use single quotes in prompt (done).
        // 3. Last ditch: try to fix common errors or return error
        // Let's rely on the prompt change first, but log specific error.
        // Maybe simple regex to escape quotes that are not structural?
        // Structural quotes: ": " | ", " | "question": | "options": | "text": | "isCorrect": | "explanation": | [{ | }] | false, | true,

        // Let's just return the error but with better logging for now, relying on the prompt fix.
        // Or, simple Replace:
        // jsonString = jsonString.replace(/\\"/g, '"'); // Unescape first? No.

        console.error("Failed JSON content:", jsonString);
        return new NextResponse(`Failed to parse AI response as JSON. Raw: ${jsonString.substring(0, 100)}...`, { status: 500 });
      } catch (e2) {
        return new NextResponse("Failed to generate valid JSON", { status: 500 });
      }
    }

    if (!Array.isArray(questions)) {
      return new NextResponse("AI response format invalid", { status: 500 });
    }

    // 4. Save to Database
    // We need to determine the starting order index
    const existingCount = await prisma.quiz.count({ where: { lessonId } });

    const createdQuestions = await Promise.all(
      questions.map(async (q: any, index: number) => {
        return prisma.quiz.create({
          data: {
            lessonId,
            question: q.question,
            options: q.options, // Prisma handles Json type
            explanation: q.explanation,
            order: existingCount + index,
          }
        });
      })
    );

    return NextResponse.json(createdQuestions);
  } catch (error: any) {
    console.error("AI Quiz Generation Error:", error);
    return NextResponse.json(
      { error: error.message, type: error.type, status: error.status },
      { status: error.status || 500 }
    );
  }
}
