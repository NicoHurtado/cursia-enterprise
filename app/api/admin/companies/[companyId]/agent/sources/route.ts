import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile } from "@/lib/agents/document-parser";
import { ingestAgentSource } from "@/lib/agents/ingestion";

async function getOrCreateAgent(companyId: string, companyName: string) {
  return prisma.companyAgent.upsert({
    where: { companyId },
    update: {},
    create: {
      companyId,
      name: `Agente ${companyName}`,
      uiColor: "#4f46e5",
      isEnabled: true,
    },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      id: true,
      name: true,
      agent: {
        select: {
          id: true,
          sourceDocuments: {
            orderBy: { createdAt: "desc" },
            include: {
              _count: {
                select: { chunks: true },
              },
            },
          },
        },
      },
    },
  });

  if (!company) {
    return new NextResponse("Company not found", { status: 404 });
  }

  if (!company.agent) {
    return NextResponse.json([]);
  }

  return NextResponse.json(company.agent.sourceDocuments);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, name: true },
  });

  if (!company) {
    return new NextResponse("Company not found", { status: 404 });
  }

  const agent = await getOrCreateAgent(company.id, company.name);
  const contentType = req.headers.get("content-type") || "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const customTitle = (formData.get("title") as string | null)?.trim();

      if (!file) {
        return new NextResponse("Missing file", { status: 400 });
      }

      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !["pdf", "docx", "txt", "png", "jpg", "jpeg", "webp"].includes(extension)) {
        return new NextResponse("Formato no soportado. Usa PDF, DOCX, TXT o imágenes PNG/JPG/JPEG/WEBP.", {
          status: 400,
        });
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const filename = `${uniqueSuffix}-${safeName}`;
      const uploadDir = path.join(process.cwd(), "public/uploads/agent-documents");
      await mkdir(uploadDir, { recursive: true });
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, fileBuffer);

      const rawText = await extractTextFromFile(file);
      const source = await ingestAgentSource({
        agentId: agent.id,
        title: customTitle || file.name,
        sourceType: "FILE",
        rawText,
        mimeType: file.type || undefined,
        filePath: `/uploads/agent-documents/${filename}`,
      });

      return NextResponse.json(source, { status: 201 });
    }

    return new NextResponse("Solo se permite carga de documentos e imágenes (PDF, DOCX, TXT, PNG, JPG, JPEG, WEBP).", {
      status: 415,
    });
  } catch (error) {
    console.error("Error creating agent source:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

