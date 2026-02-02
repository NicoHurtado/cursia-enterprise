import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/leads - Crear nuevo lead (endpoint público)
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
      // Si ya existe, retornar éxito de todas formas (para no revelar información)
      return NextResponse.json({ success: true, existing: true }, { status: 200 });
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

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating lead:", error);
    return NextResponse.json(
      { error: "Error al crear lead" },
      { status: 500 }
    );
  }
}
