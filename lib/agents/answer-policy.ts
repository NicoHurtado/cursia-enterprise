import type { AgentAnswerMode, RetrievedChunk } from "@/lib/agents/types";

const MIN_EVIDENCE_THRESHOLD = 0.2;
const STRONG_EVIDENCE_THRESHOLD = 0.35;
const AMBIGUOUS_THRESHOLD = 0.45;
const AMBIGUITY_MAX_GAP = 0.04;

const POLICY_STOPWORDS = new Set([
  "de", "la", "el", "los", "las", "y", "o", "en", "un", "una", "que",
  "con", "por", "para", "del", "al", "se", "es", "su", "sus", "como",
  "cómo", "si", "no", "lo", "le", "les", "ya", "más", "muy", "cual",
  "cuál", "donde", "dónde", "cuando", "cuándo", "qué", "quién", "hay",
  "ser", "está", "son", "tiene", "hacer", "puede", "debe", "todo",
  "esta", "este", "estos", "estas", "eso", "esa", "ese", "hola",
  "buenas", "buenos", "dias", "tardes", "noches",
]);

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function extractQueryKeywords(text: string): string[] {
  return stripAccents(text)
    .toLowerCase()
    .split(/[^a-z0-9n]+/g)
    .filter((w) => w.length >= 3 && !POLICY_STOPWORDS.has(w));
}

function chunksContainQueryKeywords(
  chunks: RetrievedChunk[],
  queryKeywords: string[]
): boolean {
  if (queryKeywords.length === 0) return true;
  // Normalize accents in content too so "política" matches keyword "politica"
  const combined = stripAccents(chunks.map((c) => c.content).join(" ")).toLowerCase();
  const matched = queryKeywords.filter((kw) => combined.includes(kw));
  // Only 1 specific keyword match is enough — don't penalize short specific queries
  if (matched.length >= 1 && queryKeywords.some((kw) => kw.length >= 4)) return true;
  return matched.length / queryKeywords.length >= 0.25;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalize(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function calibrateConfidence(
  mode: AgentAnswerMode,
  topScore: number,
  secondScore?: number
) {
  if (mode === "fallback") {
    // In fallback we intentionally communicate low certainty.
    return clamp((topScore / MIN_EVIDENCE_THRESHOLD) * 0.45, 0, 0.45);
  }

  if (mode === "ambiguous") {
    const topNorm = normalize(topScore, AMBIGUOUS_THRESHOLD, 1);
    const gap = secondScore !== undefined ? Math.abs(topScore - secondScore) : 0;
    const separation = clamp(gap / AMBIGUITY_MAX_GAP, 0, 1);
    return clamp(0.58 + topNorm * 0.2 + separation * 0.08, 0.58, 0.86);
  }

  // Grounded answers should expose user-facing confidence on a practical scale.
  if (topScore < STRONG_EVIDENCE_THRESHOLD) {
    const moderateNorm = normalize(topScore, MIN_EVIDENCE_THRESHOLD, STRONG_EVIDENCE_THRESHOLD);
    return clamp(0.72 + moderateNorm * 0.18, 0.72, 0.9);
  }

  const strongNorm = normalize(topScore, STRONG_EVIDENCE_THRESHOLD, 1);
  return clamp(0.9 + strongNorm * 0.09, 0.9, 0.99);
}

export interface EvidenceDecision {
  mode: AgentAnswerMode;
  confidence: number;
  selected: RetrievedChunk[];
}

export function decideEvidenceMode(
  rankedChunks: RetrievedChunk[],
  hasImage?: boolean,
  queryText?: string
): EvidenceDecision {
  if (rankedChunks.length === 0) {
    return {
      mode: hasImage ? "image" : "fallback",
      confidence: calibrateConfidence(hasImage ? "grounded" : "fallback", 0),
      selected: [],
    };
  }

  const top = rankedChunks[0];
  const second = rankedChunks[1];

  if (top.score < MIN_EVIDENCE_THRESHOLD) {
    return {
      mode: hasImage ? "image" : "fallback",
      confidence: calibrateConfidence(hasImage ? "grounded" : "fallback", top.score),
      selected: [],
    };
  }

  const queryKeywords = queryText ? extractQueryKeywords(queryText) : [];

  if (
    second &&
    top.score >= AMBIGUOUS_THRESHOLD &&
    second.score >= AMBIGUOUS_THRESHOLD &&
    Math.abs(top.score - second.score) <= AMBIGUITY_MAX_GAP
  ) {
    return {
      mode: "ambiguous",
      confidence: calibrateConfidence("ambiguous", top.score, second.score),
      selected: [top, second],
    };
  }

  if (
    top.score < STRONG_EVIDENCE_THRESHOLD &&
    second &&
    second.score >= MIN_EVIDENCE_THRESHOLD
  ) {
    const candidates = [top, second];
    if (!chunksContainQueryKeywords(candidates, queryKeywords)) {
      return {
        mode: hasImage ? "image" : "fallback",
        confidence: calibrateConfidence("fallback", top.score),
        selected: [],
      };
    }
    return {
      mode: "grounded",
      confidence: calibrateConfidence("grounded", top.score, second.score),
      selected: candidates,
    };
  }

  const supportingThreshold = Math.max(MIN_EVIDENCE_THRESHOLD, top.score * 0.72);
  const selected = rankedChunks
    .filter((chunk) => chunk.score >= supportingThreshold)
    .slice(0, 3);

  if (!chunksContainQueryKeywords(selected, queryKeywords)) {
    return {
      mode: hasImage ? "image" : "fallback",
      confidence: calibrateConfidence("fallback", top.score),
      selected: [],
    };
  }

  return {
    mode: "grounded",
    confidence: calibrateConfidence("grounded", top.score, second?.score),
    selected,
  };
}

