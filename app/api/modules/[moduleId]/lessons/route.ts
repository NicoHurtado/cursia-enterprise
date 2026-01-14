import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lessonSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  order: z.number(),
  videoUrl: z.string().optional().nullable(),
  audioUrl: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { moduleId } = await params;
    const body = await req.json();
    const data = lessonSchema.parse(body);

    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        content: data.content,
        order: data.order,
        videoUrl: data.videoUrl || null,
        audioUrl: data.audioUrl || null,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error creating lesson:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

