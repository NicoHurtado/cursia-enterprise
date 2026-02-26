export type AgentAnswerMode = "grounded" | "ambiguous" | "fallback" | "image";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  score: number;
}

export interface AgentSourceAlternative {
  chunkId: string;
  documentId: string;
  title: string;
  summary: string;
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
  alternatives?: AgentSourceAlternative[];
  requiresSourceSelection?: boolean;
  ambiguityEventId?: string;
}

