import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assessments = await prisma.freeAssessment.findMany({
      include: {
        _count: { select: { attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(assessments);
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, questions, passingScore, timeLimit } = await req.json();

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and at least one question are required" },
        { status: 400 }
      );
    }

    const assessment = await prisma.freeAssessment.create({
      data: {
        title,
        description,
        questions,
        passingScore: passingScore || 70,
        timeLimit: timeLimit || null,
      },
    });

    return NextResponse.json(assessment);
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
