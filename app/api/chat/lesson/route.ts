import { Anthropic } from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ModuleLesson {
    title: string;
    content: string;
}

// Defensive cap: Haiku 4.5 has 200K tokens of context; we stay well under.
// Roughly 4 chars per token, so 600K chars ~ 150K tokens worth of module content.
const MAX_MODULE_CONTENT_CHARS = 600_000;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            message,
            courseTitle,
            moduleTitle,
            currentLessonTitle,
            moduleLessons,
            lessonTitle,
            lessonContent,
        } = body as {
            message?: string;
            courseTitle?: string;
            moduleTitle?: string;
            currentLessonTitle?: string;
            moduleLessons?: ModuleLesson[];
            lessonTitle?: string;
            lessonContent?: string;
        };

        if (!message) {
            return new NextResponse("Message is required", { status: 400 });
        }

        // Build module content block. Supports new callers (module-scoped) and
        // legacy callers that still send a single lesson, so nothing breaks.
        let moduleContent: string;
        let resolvedModuleTitle = moduleTitle;
        let resolvedLessonTitle = currentLessonTitle;

        if (Array.isArray(moduleLessons) && moduleLessons.length > 0) {
            moduleContent = moduleLessons
                .map((l) => `## ${l.title}\n${l.content}`)
                .join("\n\n");
        } else if (lessonTitle && lessonContent) {
            moduleContent = `## ${lessonTitle}\n${lessonContent}`;
            resolvedModuleTitle = resolvedModuleTitle || lessonTitle;
            resolvedLessonTitle = resolvedLessonTitle || lessonTitle;
        } else {
            return new NextResponse("Missing module context", { status: 400 });
        }

        if (moduleContent.length > MAX_MODULE_CONTENT_CHARS) {
            moduleContent =
                moduleContent.slice(0, MAX_MODULE_CONTENT_CHARS) +
                "\n\n[Contenido truncado por longitud]";
        }

        const intro = `Eres el Asistente Cursia, un tutor de IA experto en una plataforma de formación corporativa.

Curso actual: "${courseTitle ?? "(no especificado)"}"
Módulo actual: "${resolvedModuleTitle ?? "(no especificado)"}"
El estudiante está ahora en la lección: "${resolvedLessonTitle ?? "(no especificado)"}"

Instrucciones:
1. Responde con base en el contenido del módulo proporcionado abajo.
2. El estudiante puede preguntar sobre cualquier lección del módulo, no solo la actual.
3. Si la respuesta está fuera del módulo, usa conocimiento general y aclara que es información adicional no cubierta en el curso.
4. Sé claro, paciente y conciso. Usa markdown cuando aporte claridad (listas, negritas).
5. No inventes hechos sobre el curso que no estén en el contenido provisto.`;

        const moduleBlock = `Contenido completo del módulo (todas las lecciones en orden):

${moduleContent}`;

        const response = await anthropic.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 1000,
            messages: [{ role: "user", content: message }],
            system: [
                { type: "text", text: intro },
                {
                    type: "text",
                    text: moduleBlock,
                    // Cache the module context so follow-up questions in the
                    // same module cost ~10% of the normal input price.
                    cache_control: { type: "ephemeral" },
                },
            ],
        });

        const first = response.content[0];
        const text = first && first.type === "text" ? first.text : "";

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("[LESSON_CHAT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
