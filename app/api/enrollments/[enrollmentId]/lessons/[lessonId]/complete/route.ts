import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { enrollmentId, lessonId } = await params;

    // Verify enrollment belongs to user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: session.user.id,
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    // Upsert lesson progress
    await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    });

    // Check if all lessons in module are completed
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (lesson) {
      const allLessonsCompleted = lesson.module.lessons.every(async (l) => {
        const progress = await prisma.lessonProgress.findUnique({
          where: {
            enrollmentId_lessonId: {
              enrollmentId,
              lessonId: l.id,
            },
          },
        });
        return progress?.completed || false;
      });

      // Update enrollment status
      const totalLessons = await prisma.lessonProgress.count({
        where: { enrollmentId, completed: true },
      });

      const allLessons = await prisma.lesson.findMany({
        where: {
          module: {
            courseId: enrollment.courseId,
          },
        },
      });

      if (totalLessons >= allLessons.length) {
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
          },
        });
      } else if (enrollment.status === "NOT_STARTED") {
        await prisma.enrollment.update({
          where: { id: enrollmentId },
          data: {
            status: "IN_PROGRESS",
            startedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error completing lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

