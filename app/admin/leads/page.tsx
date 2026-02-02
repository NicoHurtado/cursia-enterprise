"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

interface Lead {
  id: string;
  nombre: string;
  celular: string;
  correo: string;
  empresa: string;
  cargo: string;
  numEmpleados: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const LEAD_STATUSES = [
  { value: "SIN_CONTACTAR", label: "Sin contactar", color: "bg-slate-100" },
  { value: "PRIMER_CONTACTO", label: "1er contacto", color: "bg-blue-100" },
  { value: "VEINTICUATRO_HORAS_ANTES", label: "24 horas antes", color: "bg-purple-100" },
  { value: "MANANA_MISMO_DIA", label: "La mañana del mismo día", color: "bg-yellow-100" },
  { value: "MEDIA_HORA_ANTES", label: "Media hora antes", color: "bg-orange-100" },
  { value: "NO_APARECIO", label: "No apareció", color: "bg-red-100" },
  { value: "CERRADO", label: "Cerrado", color: "bg-gray-100" },
  { value: "INICIAMOS_TRABAJO", label: "Iniciamos trabajo con él", color: "bg-emerald-100" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/admin/leads");
      if (!response.ok) throw new Error("Error al cargar leads");
      const data = await response.json();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    // Actualizar localmente
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId ? { ...lead, status: newStatus } : lead
      )
    );

    // Actualizar en el servidor
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating lead:", error);
      // Revertir cambio si falla
      fetchLeads();
    }
  };

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-slate-600">Cargando leads...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Leads</h1>
          <p className="text-slate-600">Total de leads: {leads.length}</p>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEAD_STATUSES.map((status) => {
              const statusLeads = getLeadsByStatus(status.value);
              return (
                <div
                  key={status.value}
                  id={status.value}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-slate-700">
                      {status.label}
                    </h3>
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {statusLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {statusLeads.map((lead) => (
                      <div
                        key={lead.id}
                        id={lead.id}
                        draggable
                        className={`p-4 rounded-lg ${status.color} border border-slate-200 cursor-move hover:shadow-md transition-shadow`}
                      >
                        <h4 className="font-bold text-sm text-slate-900 mb-1">
                          {lead.nombre}
                        </h4>
                        <p className="text-xs text-slate-600 mb-2">{lead.empresa}</p>
                        <div className="space-y-1 text-xs text-slate-500">
                          <p>📧 {lead.correo}</p>
                          <p>📱 {lead.celular}</p>
                          <p>💼 {lead.cargo}</p>
                          <p>👥 {lead.numEmpleados} empleados</p>
                        </div>
                        {lead.notes && (
                          <p className="mt-2 text-xs text-slate-600 italic">
                            {lead.notes}
                          </p>
                        )}
                        <p className="mt-2 text-[10px] text-slate-400">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
