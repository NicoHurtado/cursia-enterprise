const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 220;

export interface TextChunk {
  content: string;
  chunkIndex: number;
  tokenCount: number;
}

function normalizeText(text: string) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

export function splitIntoChunks(
  rawText: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
): TextChunk[] {
  const text = normalizeText(rawText);
  if (!text) return [];

  const chunks: TextChunk[] = [];
  let cursor = 0;
  let chunkIndex = 0;

  while (cursor < text.length) {
    const maxEnd = Math.min(cursor + chunkSize, text.length);
    let end = maxEnd;

    // Prefer to cut on paragraph boundaries to keep semantic cohesion.
    const paragraphBreak = text.lastIndexOf("\n\n", maxEnd);
    if (paragraphBreak > cursor + 250) {
      end = paragraphBreak;
    } else {
      const sentenceBreak = Math.max(
        text.lastIndexOf(". ", maxEnd),
        text.lastIndexOf("? ", maxEnd),
        text.lastIndexOf("! ", maxEnd)
      );
      if (sentenceBreak > cursor + 200) {
        end = sentenceBreak + 1;
      }
    }

    const content = text.slice(cursor, end).trim();
    if (content) {
      chunks.push({
        content,
        chunkIndex,
        tokenCount: estimateTokens(content),
      });
      chunkIndex += 1;
    }

    if (end >= text.length) break;
    cursor = Math.max(end - overlap, cursor + 1);
  }

  return chunks;
}

