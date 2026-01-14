import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
    try {
        const { message, lessonContent, lessonTitle } = await req.json();

        if (!message) {
            return new NextResponse("Message is required", { status: 400 });
        }

        const systemPrompt = `You are an expert AI tutor for a course platform called Cursia.
Your goal is to help the student understand the current lesson.
You have access to the content of the lesson titled "${lessonTitle}".

Lesson Content:
${lessonContent}

Instructions:
1. Answer the student's questions based primarily on the lesson content provided above.
2. If the answer is not in the lesson content, you can use your general knowledge, but mention that it's additional information not covered in the lesson.
3. Be encouraging, patient, and clear.
4. Keep your answers concise and easy to digest.
5. Use markdown for formatting (bold, lists, code blocks) to improve readability.
6. If the user asks for examples, provide relevant examples related to the lesson topic.
7. Do not make up facts about the lesson if they are not there.

Current Student Question: ${message}`;

        const response = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 1000,
            messages: [{ role: "user", content: message }],
            system: systemPrompt,
        });

        const text = (response.content[0] as any).text;

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("[LESSON_CHAT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
