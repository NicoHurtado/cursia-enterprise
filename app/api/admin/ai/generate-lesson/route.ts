import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { lessonId, additionalInstructions } = await req.json();

    if (!lessonId) {
      return new NextResponse("Missing lessonId", { status: 400 });
    }

    // 1. Fetch Lesson Context
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { order: "asc" },
                  include: {
                    lessons: {
                      orderBy: { order: "asc" },
                      select: { title: true, id: true },
                    },
                  },
                },
              },
            },
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
    const courseStructure = course.modules
      .map(
        (m) =>
          `Module: ${m.title}\n${m.lessons
            .map((l) => `  - ${l.title}`)
            .join("\n")}`
      )
      .join("\n\n");

    const prompt = `
You are an expert educational content creator. Your task is to write comprehensive, verified, and high-quality content for a specific lesson in an online course.

**Course Details:**
- Title: ${course.title}
- Description: ${course.description || "N/A"}

**Current Module:**
- Title: ${currentModule.title}
- Description: ${currentModule.description || "N/A"}

**Target Lesson:**
- Title: ${lesson.title}

**Course Structure (for context):**
${courseStructure}

**Instructions:**
1.  **Content Quality:** Write extensive, detailed, and accurate content suitable for an enterprise learning environment. Ensure coherence with the course title and other lessons.
2.  **Formatting:** Use Markdown strictly.
    - Use **bold** for key terms.
    - Use tables for comparisons or structured data.
    - Use code blocks for any technical examples (if applicable to the topic).
    - Use lists for readability.
3.  **Tone:** Professional, educational, and engaging.
4.  **Output:** Return ONLY the content of the lesson. Do not include conversational filler like "Here is the content..." or "Sure, I can help with that." Start directly with the lesson introduction.
5.  **Verification:** Ensure all facts and technical details are correct.

${additionalInstructions ? `**Additional Instructions:**\n${additionalInstructions}` : ""}

Write the content for the lesson "${lesson.title}" now.
    `.trim();

    // 3. Call Anthropic API
    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const generatedContent = (message.content[0] as any).text;

    // 4. Update Lesson
    await prisma.lesson.update({
      where: { id: lessonId },
      data: { content: generatedContent },
    });

    return NextResponse.json({ content: generatedContent });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error.message, type: error.type, status: error.status },
      { status: error.status || 500 }
    );
  }
}
