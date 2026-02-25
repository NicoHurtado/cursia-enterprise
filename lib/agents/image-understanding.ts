import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { createWorker } from "tesseract.js";

export const SUPPORTED_IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp"]);

export function isSupportedImageExtension(extension?: string) {
  return !!extension && SUPPORTED_IMAGE_EXTENSIONS.has(extension);
}

export function isSupportedImageMimeType(mimeType?: string | null) {
  if (!mimeType) return false;
  return ["image/png", "image/jpeg", "image/webp"].includes(mimeType.toLowerCase());
}

export async function extractImageOcrText(buffer: Buffer) {
  const worker = await createWorker("spa+eng");
  try {
    const result = await worker.recognize(buffer);
    return result.data.text?.trim() || "";
  } finally {
    await worker.terminate();
  }
}

async function describeImageWithAnthropic(
  base64: string,
  mimeType: string,
  prompt: string
) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) return "";
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await anthropic.messages.create({
      model: process.env.VISION_MODEL || process.env.LLM_MODEL || "claude-3-5-sonnet-20241022",
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as any,
                data: base64,
              } as any,
            },
          ] as any,
        },
      ],
    });
    const block = response.content.find((item) => item.type === "text");
    return block && "text" in block ? (block.text || "").trim() : "";
  } catch (error) {
    console.error("Anthropic vision error:", error);
    return "";
  }
}

async function describeImageWithOpenAI(base64: string, mimeType: string, prompt: string) {
  try {
    if (!process.env.OPENAI_API_KEY) return "";
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: process.env.VISION_MODEL || process.env.LLM_MODEL || "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });
    return response.choices[0]?.message?.content?.trim() || "";
  } catch (error) {
    console.error("OpenAI vision error:", error);
    return "";
  }
}

export async function describeImageWithLlm(
  buffer: Buffer,
  mimeType = "image/png",
  prompt: string
) {
  const base64 = buffer.toString("base64");
  const preferredProvider = (process.env.VISION_PROVIDER || "anthropic").toLowerCase();

  if (preferredProvider === "openai") {
    const openAiDescription = await describeImageWithOpenAI(base64, mimeType, prompt);
    if (openAiDescription) return openAiDescription;
    return describeImageWithAnthropic(base64, mimeType, prompt);
  }

  const anthropicDescription = await describeImageWithAnthropic(base64, mimeType, prompt);
  if (anthropicDescription) return anthropicDescription;
  return describeImageWithOpenAI(base64, mimeType, prompt);
}

export async function buildImageKnowledgeText(file: File, contextPrompt: string) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!isSupportedImageExtension(extension) && !isSupportedImageMimeType(file.type || null)) {
    return "";
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const [ocrResult, visionResult] = await Promise.allSettled([
    extractImageOcrText(buffer),
    describeImageWithLlm(buffer, file.type || "image/png", contextPrompt),
  ]);
  const ocrText = ocrResult.status === "fulfilled" ? ocrResult.value : "";
  const visionDescription = visionResult.status === "fulfilled" ? visionResult.value : "";

  const sections = [
    ocrText ? `OCR:\n${ocrText}` : "",
    visionDescription ? `VISION:\n${visionDescription}` : "",
  ].filter(Boolean);

  return sections.join("\n\n").trim();
}

