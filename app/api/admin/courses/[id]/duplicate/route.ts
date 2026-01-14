
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("Duplicating course with ID:", id); // Verify route and ID

    const originalCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                quizzes: true,
                flashcards: true,
              },
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        finalEvaluation: true,
      },
    });

    if (!originalCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Create the new course with copied data
    const newCourse = await prisma.course.create({
      data: {
        title: `Copia de ${originalCourse.title}`,
        description: originalCourse.description,
        status: "DRAFT",
        creatorId: session.user.id, // Assign to current admin
        companyId: originalCourse.companyId, // Keep same company association if any

        // Deep copy modules and their contents
        modules: {
          create: originalCourse.modules.map((module) => ({
            title: module.title,
            description: module.description,
            order: module.order,
            lessons: {
              create: module.lessons.map((lesson) => ({
                title: lesson.title,
                content: lesson.content,
                order: lesson.order,
                videoUrl: lesson.videoUrl,
                audioUrl: lesson.audioUrl,
                // images: (lesson.images || []) as any, // Ensure images are copied

                // Copy quizzes
                quizzes: {
                  create: lesson.quizzes.map((quiz) => ({
                    question: quiz.question,
                    options: quiz.options ?? [],
                    explanation: quiz.explanation,
                    order: quiz.order,
                  })),
                },

                // Copy flashcards
                flashcards: {
                  create: lesson.flashcards.map((flashcard) => ({
                    front: flashcard.front,
                    back: flashcard.back,
                    order: flashcard.order,
                  })),
                },
              })),
            },
          })),
        },

        // Copy final evaluation if it exists
        ...(originalCourse.finalEvaluation && {
          finalEvaluation: {
            create: {
              questions: originalCourse.finalEvaluation.questions ?? [],
              passingScore: originalCourse.finalEvaluation.passingScore,
            },
          },
        }),
      },
    });

    return NextResponse.json(newCourse);
  } catch (error) {
    console.error("Error duplicating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
