const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;
const MIN_SECTION_LENGTH = 60;

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

function detectSectionBoundaries(text: string): number[] {
  const boundaries: number[] = [];
  const lines = text.split("\n");
  let pos = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length > 0 && pos > 0) {
      const isNumberedSection = /^\d+[\.\)]\s+\S/.test(line);
      const isMarkdownHeader = /^#{1,3}\s+\S/.test(line);
      const isAllCapsHeader =
        line.length >= 4 &&
        line.length <= 80 &&
        line === line.toUpperCase() &&
        /[A-Z]{2,}/.test(line);

      if (isNumberedSection || isMarkdownHeader || isAllCapsHeader) {
        boundaries.push(pos);
      }
    }
    pos += lines[i].length + 1;
  }

  return boundaries;
}

function splitLongText(
  text: string,
  chunkSize: number,
  overlap: number
): string[] {
  const result: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const maxEnd = Math.min(cursor + chunkSize, text.length);
    let end = maxEnd;

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
    if (content) result.push(content);
    if (end >= text.length) break;
    cursor = Math.max(end - overlap, cursor + 1);
  }

  return result;
}

export function splitIntoChunks(
  rawText: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_CHUNK_OVERLAP
): TextChunk[] {
  const text = normalizeText(rawText);
  if (!text) return [];

  const boundaries = detectSectionBoundaries(text);

  if (boundaries.length === 0) {
    return splitLongText(text, chunkSize, overlap).map((content, i) => ({
      content,
      chunkIndex: i,
      tokenCount: estimateTokens(content),
    }));
  }

  const allBoundaries = [0, ...boundaries, text.length];
  const sections: string[] = [];

  for (let i = 0; i < allBoundaries.length - 1; i++) {
    const section = text.slice(allBoundaries[i], allBoundaries[i + 1]).trim();
    if (section.length >= MIN_SECTION_LENGTH) {
      sections.push(section);
    } else if (section.length > 0 && sections.length > 0) {
      sections[sections.length - 1] += "\n\n" + section;
    } else if (section.length > 0) {
      sections.push(section);
    }
  }

  const chunks: TextChunk[] = [];
  let chunkIndex = 0;

  for (const section of sections) {
    if (section.length <= chunkSize) {
      chunks.push({
        content: section,
        chunkIndex: chunkIndex++,
        tokenCount: estimateTokens(section),
      });
    } else {
      for (const sub of splitLongText(section, chunkSize, overlap)) {
        chunks.push({
          content: sub,
          chunkIndex: chunkIndex++,
          tokenCount: estimateTokens(sub),
        });
      }
    }
  }

  return chunks;
}
