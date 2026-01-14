"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const courseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  companyId: z.string().optional().or(z.literal("none")),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  companies: Array<{ id: string; name: string }>;
  creatorId: string;
  course?: {
    id: string;
    title: string;
    description: string | null;
    companyId: string | null;
  };
}

export function CourseForm({ companies, creatorId, course }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course 
      ? {
          title: course.title,
          description: course.description || "",
          companyId: course.companyId || "none",
        }
      : {
          title: "",
          description: "",
          companyId: "none",
        },
  });

  const companyId = watch("companyId");

  const onSubmit = async (data: CourseFormData) => {
    setLoading(true);
    try {
      const url = course
        ? `/api/courses/${course.id}`
        : "/api/courses";
      const method = course ? "PUT" : "POST";

      // Convert "none" to null for companyId
      const companyIdValue = data.companyId === "none" || !data.companyId ? null : data.companyId;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          creatorId,
          companyId: companyIdValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar el curso");
      }

      const result = await response.json();
      router.push(`/admin/courses/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al guardar el curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{course ? "Editar Curso" : "Información Básica"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del Curso *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Ej: Introducción a la Seguridad Informática"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              {...register("description")}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Descripción breve del curso..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId">Empresa (Opcional)</Label>
            <Select
              value={companyId || "none"}
              onValueChange={(value) => setValue("companyId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguna (Curso general)</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : course ? "Actualizar" : "Crear Curso"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

