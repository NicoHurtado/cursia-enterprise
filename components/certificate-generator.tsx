"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";

interface CertificateGeneratorProps {
  studentName: string;
  studentId?: string;
  studentEmail: string;
  courseName: string;
  companyName: string;
  completionDate: Date;
}

export function CertificateGenerator({
  studentName,
  studentId,
  studentEmail,
  courseName,
  companyName,
  completionDate,
}: CertificateGeneratorProps) {
  const generatePDF = () => {
    // Create a new PDF document (landscape)
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Dimensions
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, "F");

    // Border
    doc.setLineWidth(2);
    doc.setDrawColor(20, 50, 100); // Dark Blue
    doc.rect(10, 10, width - 20, height - 20);

    // Inner Border
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.rect(15, 15, width - 30, height - 30);

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(20, 50, 100);
    doc.text("CERTIFICADO DE FINALIZACIÓN", width / 2, 50, { align: "center" });

    // Subheader
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("Este certificado se otorga a", width / 2, 70, { align: "center" });

    // Student Name
    doc.setFont("times", "bolditalic");
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(studentName, width / 2, 90, { align: "center" });

    // Student Details
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 80);
    let details = `Email: ${studentEmail}`;
    if (studentId) {
      details += ` | ID: ${studentId}`;
    }
    doc.text(details, width / 2, 105, { align: "center" });

    // Course Text
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("Por haber completado satisfactoriamente el curso", width / 2, 125, { align: "center" });

    // Course Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(20, 50, 100);
    doc.text(courseName, width / 2, 140, { align: "center" });

    // Company
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Impartido por ${companyName}`, width / 2, 155, { align: "center" });

    // Date
    const formattedDate = completionDate.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Fecha de finalización: ${formattedDate}`, width / 2, 170, { align: "center" });

    // Signature Line (Decorative)
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(width / 2 - 40, 190, width / 2 + 40, 190);

    doc.setFontSize(10);
    doc.text("Cursia for Enterprise", width / 2, 195, { align: "center" });

    // Save
    doc.save(`certificado_${courseName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <Button onClick={generatePDF} variant="outline" className="gap-2">
      <Download className="w-4 h-4" />
      Descargar Certificado
    </Button>
  );
}
