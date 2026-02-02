import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/leads - Obtener todos los leads
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Error al obtener leads" },
      { status: 500 }
    );
  }
}

// POST /api/admin/leads - Crear nuevo lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, celular, correo, empresa, cargo, numEmpleados } = body;

    // Validar campos requeridos
    if (!nombre || !celular || !correo || !empresa || !cargo || !numEmpleados) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el lead ya existe
    const existingLead = await prisma.lead.findUnique({
      where: { correo },
    });

    if (existingLead) {
      return NextResponse.json(
        { error: "Ya existe un lead con este correo" },
        { status: 409 }
      );
    }

    // Crear el lead
    const lead = await prisma.lead.create({
      data: {
        nombre,
        celular,
        correo,
        empresa,
        cargo,
        numEmpleados,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Error al crear lead" },
      { status: 500 }
    );
  }
}
