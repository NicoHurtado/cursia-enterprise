import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const lessonImageSchema = z.object({
  url: z.string(),
  title: z.string().optional().default(""),
  description: z.string().optional().default(""),
});

const lessonUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  videoUrl: z.string().nullable().optional(),
  audioUrl: z.string().nullable().optional(),
  images: z.union([
    z.array(lessonImageSchema),
    z.array(z.string()), // for backward compatibility
  ]).optional(),
  order: z.number().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await params;
    const body = await req.json();
    // console.log("Updating lesson", lessonId, "Body:", JSON.stringify(body, null, 2));
    const data = lessonUpdateSchema.parse(body);

    const lesson = await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.audioUrl !== undefined && { audioUrl: data.audioUrl }),
        ...(data.images !== undefined && { images: data.images }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { lessonId } = await params;

    await prisma.lesson.delete({
      where: { id: lessonId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
