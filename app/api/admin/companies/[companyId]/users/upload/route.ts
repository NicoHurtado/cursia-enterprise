import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as XLSX from "xlsx";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { companyId } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    const results = {
      success: 0,
      errors: [] as string[],
    };

    // Skip empty rows
    const rows = data.filter(row => row.length > 0);

    if (rows.length === 0) {
      return NextResponse.json({ success: 0, errors: ["El archivo está vacío"] });
    }

    // Check if first row is a header
    const firstRow = rows[0];
    const hasHeaders =
      String(firstRow[0]).toLowerCase().includes("nombre") ||
      String(firstRow[1]).toLowerCase().includes("correo") ||
      String(firstRow[1]).toLowerCase().includes("email");

    const startRow = hasHeaders ? 1 : 0;

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      // Expecting: Name (0), Email (1), Cedula (2)
      // Or: Name (0), Email (1)

      const name = row[0];
      const email = row[1];
      const cedula = row[2]; // Still reading "Cedula" from Excel, but storing as nationalId

      if (!email || !String(email).includes("@")) {
        results.errors.push(`Fila ${i + 1}: Correo inválido o faltante (${email})`);
        continue;
      }

      try {
        await prisma.preRegisteredUser.upsert({
          where: { email: String(email).trim() },
          update: {
            name: name ? String(name).trim() : undefined,
            nationalId: cedula ? String(cedula).trim() : undefined,
            companyId,
          },
          create: {
            email: String(email).trim(),
            name: name ? String(name).trim() : undefined,
            nationalId: cedula ? String(cedula).trim() : undefined,
            companyId,
            isRegistered: false,
          },
        });
        results.success++;
      } catch (e) {
        results.errors.push(`Error procesando ${email}: ${e}`);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error processing upload:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
