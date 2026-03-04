import Anthropic from "@anthropic-ai/sdk";

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DocumentQualityAnalysis {
  missingSections: string[];
  ambiguous: string[];
  suggestions: string[];
}

export interface DocumentQualityResult {
  score: number; // 0 to 100
  analysis: DocumentQualityAnalysis;
}

export async function evaluateDocumentQuality(
  title: string,
  rawText: string
): Promise<DocumentQualityResult | null> {
  try {
    // Truncate text to roughly 15k chars to save tokens on huge documents,
    // usually enough to get a grasp of formatting, completeness, and quality.
    const textToAnalyze = rawText.slice(0, 15000);

    const systemPrompt = `
Eres un auditor experto en documentación corporativa y calidad de datos empresariales.
Tu objetivo es evaluar el texto de un documento subido a la base de conocimiento de una IA (RAG)
y proporcionar feedback objetivo sobre su utilidad, claridad y completitud.

Instrucciones:
1. Analiza el documento buscando faltas de contexto, secciones ambiguas que puedan confundir a un empleado o a la IA, y oportunidades de mejora operativa.
2. Genera una puntuación de calidad (0-100), donde 100 es un documento perfectamente estructurado, claro y completo, y 0 es ininteligible o casi sin información útil.
3. Extrae hasta 3 "secciones faltantes" (missingSections) que harían el documento más útil (ej. "Datos de contacto para soporte", "Pasos de resolución de errores").
4. Extrae hasta 3 "ambigüedades" (ambiguous) (ej. "Se menciona una clave genérica sin especificar red", "Hay dos URLs de CRM sin aclarar cuál usar").
5. Extrae hasta 3 "sugerencias operativas" (suggestions) (ej. "Documentar un proceso de onboarding oficial", "Unificar las versiones del manual").

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin Markdown, sin formato adicional, con esta estructura exacta:
{
  "score": número entero de 0 a 100,
  "missingSections": ["string", "string"],
  "ambiguous": ["string", "string"],
  "suggestions": ["string", "string"]
}
`.trim();

    const response = await anthropicClient.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      temperature: 0.2, // Low temperature for consistent JSON
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Título del documento: ${title}\n\nContenido:\n${textToAnalyze}`,
        },
      ],
    });

    const outputText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Parse the JSON. Clean up any accidental markdown blocks first.
    const cleanJsonString = outputText.replace(/```json\n?|\n?```/g, "").trim();
    const result = JSON.parse(cleanJsonString);

    return {
      score: typeof result.score === "number" ? result.score : 50,
      analysis: {
        missingSections: Array.isArray(result.missingSections) ? result.missingSections : [],
        ambiguous: Array.isArray(result.ambiguous) ? result.ambiguous : [],
        suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      },
    };
  } catch (error) {
    console.error("Error evaluating document quality:", error);
    // Silent fail so we don't break main document ingestion
    return null;
  }
}
