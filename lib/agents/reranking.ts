import Anthropic from "@anthropic-ai/sdk";
import type { RetrievedChunk } from "@/lib/agents/types";

const RERANK_MODELS = [
  "claude-haiku-4-5-20251001",
  "claude-3-5-haiku-latest",
  "claude-3-haiku-20240307",
];

export async function rerankChunksWithLLM(
  question: string,
  chunks: RetrievedChunk[],
  maxSelect = 5
): Promise<RetrievedChunk[]> {
  if (chunks.length <= maxSelect) return chunks;
  if (!process.env.ANTHROPIC_API_KEY) return chunks.slice(0, maxSelect);

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const chunkSummaries = chunks
    .map((c, i) => `[${i}] (${c.documentTitle}) ${c.content.slice(0, 250)}`)
    .join("\n");

  const prompt = `Pregunta del usuario: "${question}"

Fragmentos de documentos internos:
${chunkSummaries}

¿Cuáles fragmentos contienen información relevante para responder la pregunta?
Responde ÚNICAMENTE con un array JSON de índices, máximo ${maxSelect}. Ejemplo: [2,0,5]`;

  for (const model of RERANK_MODELS) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 60,
        messages: [{ role: "user", content: prompt }],
      });

      const text = (response.content[0] as Anthropic.TextBlock).text;
      const match = text.match(/\[[\d,\s]+\]/);
      if (!match) continue;

      const indices: number[] = JSON.parse(match[0]);
      const selected = indices
        .filter((i) => i >= 0 && i < chunks.length)
        .slice(0, maxSelect)
        .map((i) => chunks[i]);

      if (selected.length > 0) return selected;
    } catch (error) {
      const status = (error as { status?: number }).status;
      if (status === 404 || status === 429) continue;
      console.warn(`LLM rerank failed with ${model}:`, error);
    }
  }

  return chunks.slice(0, maxSelect);
}
