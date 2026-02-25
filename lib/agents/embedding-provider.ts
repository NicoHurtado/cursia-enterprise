import OpenAI from "openai";

export interface EmbeddingPayload {
  vectors: number[][];
  provider: string;
  model: string;
}

function getEmbeddingConfig() {
  const provider = (process.env.EMBEDDING_PROVIDER || "openai").toLowerCase();
  const model = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
  return { provider, model };
}

function hashToVector(text: string, size = 256) {
  const vector = new Array<number>(size).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    const idx = (i * 31) % size;
    const code = text.charCodeAt(i);
    vector[idx] += code % 97;
  }
  const norm = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0)) || 1;
  return vector.map((value) => value / norm);
}

export async function embedTexts(texts: string[]): Promise<EmbeddingPayload> {
  const { provider, model } = getEmbeddingConfig();

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai.");
    }
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.embeddings.create({
      model,
      input: texts,
    });

    return {
      vectors: response.data.map((item) => item.embedding),
      provider,
      model,
    };
  }

  if (provider === "mock") {
    return {
      vectors: texts.map((text) => hashToVector(text)),
      provider,
      model: "mock-hash-v1",
    };
  }

  throw new Error(`Unsupported EMBEDDING_PROVIDER: ${provider}`);
}

export async function embedSingleText(text: string) {
  const result = await embedTexts([text]);
  return {
    vector: result.vectors[0],
    provider: result.provider,
    model: result.model,
  };
}

