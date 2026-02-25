import type { RetrievedChunk } from "@/lib/agents/types";

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denominator) return 0;
  return dot / denominator;
}

const STOPWORDS = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "y",
  "o",
  "en",
  "un",
  "una",
  "que",
  "con",
  "por",
  "para",
  "del",
  "al",
  "se",
  "es",
  "su",
  "sus",
  "como",
  "cómo",
  "si",
  "no",
  "lo",
  "le",
  "les",
  "ya",
  "más",
  "mas",
  "muy",
]);

function normalizeToken(token: string) {
  return token
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function stemToken(token: string) {
  let current = token;
  const suffixes = [
    "mente",
    "ciones",
    "cion",
    "siones",
    "sion",
    "adores",
    "adora",
    "ador",
    "acion",
    "ando",
    "iendo",
    "ados",
    "adas",
    "ado",
    "ada",
    "idos",
    "idas",
    "ido",
    "ida",
    "ar",
    "er",
    "ir",
    "es",
    "s",
  ];
  for (const suffix of suffixes) {
    if (current.endsWith(suffix) && current.length > suffix.length + 2) {
      current = current.slice(0, -suffix.length);
      break;
    }
  }
  return current;
}

function tokenize(text: string) {
  return text
    .split(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]+/g)
    .map(normalizeToken)
    .map(stemToken)
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

export function buildLexicalVector(text: string): Record<string, number> {
  const tokens = tokenize(text);
  if (tokens.length === 0) return {};

  const counts: Record<string, number> = {};
  for (const token of tokens) {
    counts[token] = (counts[token] || 0) + 1;
  }

  const total = tokens.length;
  Object.keys(counts).forEach((token) => {
    counts[token] = counts[token] / total;
  });
  return counts;
}

function lexicalSimilarityFromVectors(
  queryVector: Record<string, number>,
  chunkVector: Record<string, number>
) {
  const queryTokens = Object.keys(queryVector);
  if (queryTokens.length === 0) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  queryTokens.forEach((token) => {
    const a = queryVector[token] || 0;
    const b = chunkVector[token] || 0;
    dot += a * b;
    normA += a * a;
  });
  Object.values(chunkVector).forEach((value) => {
    normB += value * value;
  });

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (!denominator) return 0;
  return dot / denominator;
}

function tokenCoverageFromVectors(
  queryVector: Record<string, number>,
  chunkVector: Record<string, number>
) {
  const queryTokens = Object.keys(queryVector);
  if (queryTokens.length === 0) return 0;

  let matched = 0;
  queryTokens.forEach((token) => {
    if ((chunkVector[token] || 0) > 0) {
      matched += 1;
    }
  });

  return matched / queryTokens.length;
}

export function lexicalSimilarity(query: string, content: string) {
  const queryVector = buildLexicalVector(query);
  const chunkVector = buildLexicalVector(content);
  return lexicalSimilarityFromVectors(queryVector, chunkVector);
}

function extractMainConcept(vector: Record<string, number>) {
  let bestToken: string | null = null;
  let bestWeight = 0;
  for (const [token, weight] of Object.entries(vector)) {
    if (weight > bestWeight) {
      bestWeight = weight;
      bestToken = token;
    }
  }
  return bestToken;
}

function conceptSimilarity(
  queryVector: Record<string, number>,
  chunkVector: Record<string, number>
) {
  const queryMain = extractMainConcept(queryVector);
  const chunkMain = extractMainConcept(chunkVector);
  if (!queryMain || !chunkMain) return 0;
  if (queryMain === chunkMain) return 1;
  if (chunkVector[queryMain]) return 0.85;
  if (
    queryMain.length >= 4 &&
    chunkMain.length >= 4 &&
    (queryMain.startsWith(chunkMain.slice(0, 4)) ||
      chunkMain.startsWith(queryMain.slice(0, 4)))
  ) {
    return 0.65;
  }
  return 0;
}

export interface CandidateChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  embeddingVector: number[];
  lexicalVector?: Record<string, number> | null;
}

export function rankChunksBySimilarity(
  queryText: string,
  queryVector: number[],
  chunks: CandidateChunk[],
  topK = 6
): RetrievedChunk[] {
  const queryLexicalVector = buildLexicalVector(queryText);
  const ranked = chunks
    .map((chunk) => {
      const semantic = cosineSimilarity(queryVector, chunk.embeddingVector);
      const chunkLexicalVector = chunk.lexicalVector
        ? lexicalSimilarityFromVectors(queryLexicalVector, chunk.lexicalVector)
        : lexicalSimilarity(queryText, chunk.content);
      const tokenCoverage = chunk.lexicalVector
        ? tokenCoverageFromVectors(queryLexicalVector, chunk.lexicalVector)
        : tokenCoverageFromVectors(queryLexicalVector, buildLexicalVector(chunk.content));
      const concept = chunk.lexicalVector
        ? conceptSimilarity(queryLexicalVector, chunk.lexicalVector)
        : conceptSimilarity(queryLexicalVector, buildLexicalVector(chunk.content));
      // Coverage avoids penalizing long chunks that still contain query terms.
      const score =
        semantic * 0.3 + chunkLexicalVector * 0.25 + tokenCoverage * 0.35 + concept * 0.1;
      return {
        id: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.documentTitle,
        content: chunk.content,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked;
}

