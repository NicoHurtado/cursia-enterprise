import type { AgentAnswerMode, RetrievedChunk } from "@/lib/agents/types";

const MIN_FALLBACK_THRESHOLD = 0.05;
const STRONG_EVIDENCE_THRESHOLD = 0.35;
const AMBIGUOUS_THRESHOLD = 0.30;
const AMBIGUITY_MAX_GAP = 0.04;

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
    return clamp((topScore / MIN_FALLBACK_THRESHOLD) * 0.45, 0, 0.45);
  }

  if (mode === "ambiguous") {
    const topNorm = normalize(topScore, AMBIGUOUS_THRESHOLD, 1);
    const gap = secondScore !== undefined ? Math.abs(topScore - secondScore) : 0;
    const separation = clamp(gap / AMBIGUITY_MAX_GAP, 0, 1);
    return clamp(0.58 + topNorm * 0.2 + separation * 0.08, 0.58, 0.86);
  }

  if (topScore < STRONG_EVIDENCE_THRESHOLD) {
    const moderateNorm = normalize(topScore, MIN_FALLBACK_THRESHOLD, STRONG_EVIDENCE_THRESHOLD);
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

  if (top.score < MIN_FALLBACK_THRESHOLD) {
    return {
      mode: hasImage ? "image" : "fallback",
      confidence: calibrateConfidence(hasImage ? "grounded" : "fallback", top.score),
      selected: [],
    };
  }

  if (
    second &&
    top.documentId !== second.documentId &&
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

  // Send up to 5 chunks to the LLM — let it decide what's relevant.
  // Only filter out chunks with truly negligible scores.
  const minScore = Math.max(MIN_FALLBACK_THRESHOLD, top.score * 0.35);
  const selected = rankedChunks
    .filter((chunk) => chunk.score >= minScore)
    .slice(0, 5);

  return {
    mode: "grounded",
    confidence: calibrateConfidence("grounded", top.score, second?.score),
    selected,
  };
}
