export type AgentAnswerMode = "grounded" | "ambiguous" | "fallback";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
}

export interface AgentCitation {
  documentId: string;
  title: string;
  excerpt: string;
  score: number;
}

export interface AgentAnswerResult {
  mode: AgentAnswerMode;
  answer: string;
  citations: AgentCitation[];
  confidence: number;
}

