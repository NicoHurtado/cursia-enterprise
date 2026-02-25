import type { AgentAnswerMode, RetrievedChunk } from "@/lib/agents/types";

// Hybrid retrieval (semantic + lexical) usually produces useful scores
// in a much lower range than pure cosine percentages.
const MIN_EVIDENCE_THRESHOLD = 0.2;
const STRONG_EVIDENCE_THRESHOLD = 0.35;
const AMBIGUOUS_THRESHOLD = 0.45;
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

export function decideEvidenceMode(rankedChunks: RetrievedChunk[]): EvidenceDecision {
  if (rankedChunks.length === 0) {
    return { mode: "fallback", confidence: calibrateConfidence("fallback", 0), selected: [] };
  }

  const top = rankedChunks[0];
  const second = rankedChunks[1];

  if (top.score < MIN_EVIDENCE_THRESHOLD) {
    return {
      mode: "fallback",
      confidence: calibrateConfidence("fallback", top.score),
      selected: [],
    };
  }

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

  // If evidence is moderate, include up to 2 chunks to improve answer completeness.
  if (
    top.score < STRONG_EVIDENCE_THRESHOLD &&
    second &&
    second.score >= MIN_EVIDENCE_THRESHOLD
  ) {
    return {
      mode: "grounded",
      confidence: calibrateConfidence("grounded", top.score, second.score),
      selected: [top, second],
    };
  }

  // Strong evidence: keep top chunk plus close-supporting chunks.
  const supportingThreshold = Math.max(MIN_EVIDENCE_THRESHOLD, top.score * 0.72);
  const selected = rankedChunks
    .filter((chunk) => chunk.score >= supportingThreshold)
    .slice(0, 3);

  return {
    mode: "grounded",
    confidence: calibrateConfidence("grounded", top.score, second?.score),
    selected,
  };
}

