import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const feedbackSchema = z.object({
  messageId: z.string().min(1),
  helpful: z.boolean(),
  comment: z.string().max(500).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { agentId } = await params;

  try {
    const body = feedbackSchema.parse(await req.json());

    const message = await prisma.agentMessage.findFirst({
      where: {
        id: body.messageId,
        role: "ASSISTANT",
        conversation: { agentId, userId: session.user.id },
      },
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    const feedback = await prisma.agentMessageFeedback.upsert({
      where: { messageId: body.messageId },
      update: {
        helpful: body.helpful,
        comment: body.comment || null,
      },
      create: {
        messageId: body.messageId,
        userId: session.user.id,
        helpful: body.helpful,
        comment: body.comment || null,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ issues: error.issues }, { status: 400 });
    }
    console.error("Feedback error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
