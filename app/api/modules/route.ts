import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const moduleSchema = z.object({
  courseId: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = moduleSchema.parse(body);

    const createdModule = await prisma.module.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        description: data.description || null,
        order: data.order,
      },
    });

    // Revalidate the course page to show the new module
    revalidatePath(`/admin/courses/${data.courseId}`);

    return NextResponse.json(createdModule);
  } catch (error) {
    console.error("Error creating module:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

