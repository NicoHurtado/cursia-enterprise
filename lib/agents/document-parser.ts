import mammoth from "mammoth";
import {
  buildImageKnowledgeText,
  isSupportedImageExtension,
} from "@/lib/agents/image-understanding";

export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "txt") {
    return buffer.toString("utf-8");
  }

  if (extension === "pdf") {
    const pdfModule = await import("pdf-parse");
    const parsePdf = (pdfModule as any).default || (pdfModule as any);
    const parsed = await parsePdf(buffer);
    return parsed.text || "";
  }

  if (extension === "docx") {
    const parsed = await mammoth.extractRawText({ buffer });
    return parsed.value || "";
  }

  const imageText = await buildImageKnowledgeText(
    file,
    "Describe en español el contenido relevante de esta imagen para base de conocimiento interna. Incluye títulos, etiquetas, datos visibles y contexto útil."
  );
  if (imageText) {
    return imageText;
  }

  if (isSupportedImageExtension(extension)) {
    throw new Error(
      "No se pudo extraer texto útil de la imagen. Intenta con una imagen de mayor resolución."
    );
  }

  throw new Error("Formato no soportado. Usa PDF, DOCX, TXT o imágenes PNG/JPG/JPEG/WEBP.");
}

