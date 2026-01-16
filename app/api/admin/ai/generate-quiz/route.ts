import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";

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
        - \`isCorrect\`: Boolean (true for ONLY ONE correct answer, false for all others).
    - \`explanation\`: A brief explanation of why the correct answer is correct (string).
3.  **CRITICAL JSON RULES:**
    - Each question MUST have EXACTLY ONE option with isCorrect: true and THREE options with isCorrect: false
    - NEVER mark multiple options as correct (isCorrect: true) - this is a common mistake, avoid it!
    - Use ONLY straight double quotes ("), never curly/smart quotes ("")
    - Avoid special characters like em-dashes (—), use regular hyphens (-)
    - Do NOT use double quotes inside text strings - use single quotes (') instead
    - Ensure all strings are properly closed
    - Return ONLY valid JSON - no markdown, no code blocks, no extra text
4.  **Example of correct format:**
    {
      "question": "What is 2+2?",
      "options": [
        {"text": "3", "isCorrect": false},
        {"text": "4", "isCorrect": true},
        {"text": "5", "isCorrect": false},
        {"text": "6", "isCorrect": false}
      ],
      "explanation": "2+2 equals 4."
    }
5.  **Difficulty:** Mixed (some easy, some medium, some hard).
6.  **Language:** Spanish (or match the content language).

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
      console.error("Initial JSON parse failed. Attempting to repair...", e);
      try {
        // Step 1: Basic cleanup
        let cleaned = jsonString;

        // Remove markdown code block markers
        cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '');

        // Replace ALL variations of smart/curly quotes with straight quotes
        // This includes: " " ' ' (U+201C, U+201D, U+2018, U+2019)
        cleaned = cleaned.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");

        // Replace em-dashes and en-dashes
        cleaned = cleaned.replace(/—/g, '-').replace(/–/g, '-');

        // Remove control characters except newlines and tabs
        cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        console.log("Cleaned JSON (first 500 chars):", cleaned.substring(0, 500));

        // Step 2: Try parsing cleaned JSON
        try {
          questions = JSON.parse(cleaned);
        } catch (e2) {
          // Step 3: Use jsonrepair library as last resort
          console.log("Attempting JSON repair with jsonrepair library...");
          const repaired = jsonrepair(cleaned);
          console.log("Repaired JSON (first 500 chars):", repaired.substring(0, 500));
          questions = JSON.parse(repaired);
        }
      } catch (e2) {
        console.error("All repair attempts failed. Full JSON content:", jsonString);
        return new NextResponse(
          `Failed to parse AI response as JSON. The AI generated invalid JSON that could not be repaired. Please try again. Error: ${(e2 as Error).message}`,
          { status: 500 }
        );
      }
    }

    if (!Array.isArray(questions)) {
      return new NextResponse("AI response format invalid", { status: 500 });
    }

    // Validate and fix questions to ensure exactly one correct answer per question
    questions = questions.map((q: any, idx: number) => {
      if (!q.options || !Array.isArray(q.options)) {
        console.warn(`Question ${idx + 1} has invalid options array`);
        return q;
      }

      const correctCount = q.options.filter((opt: any) => opt.isCorrect === true).length;

      if (correctCount !== 1) {
        console.warn(`Question ${idx + 1} has ${correctCount} correct answers. Fixing to have exactly 1.`);

        // Fix: Set the first option as correct, all others as false
        q.options = q.options.map((opt: any, optIdx: number) => ({
          ...opt,
          isCorrect: optIdx === 0
        }));
      }

      return q;
    });


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
