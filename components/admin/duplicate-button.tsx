"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DuplicateButtonProps extends ButtonProps {
  courseId: string;
}

export function DuplicateButton({ courseId, className, variant = "ghost", size = "icon", ...props }: DuplicateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        // const newCourse = await response.json();
        router.refresh();
      } else {
        alert("Error al duplicar el curso");
      }
    } catch (error) {
      console.error("Error duplicating course:", error);
      alert("Error al duplicar el curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={loading}
          title="Duplicar curso"
          {...props}
        >
          <Copy className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Duplicar curso?</AlertDialogTitle>
          <AlertDialogDescription>
            Se creará una copia exacta del curso con todos sus módulos, lecciones y evaluaciones. El nuevo curso se creará como BORRADOR.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDuplicate} disabled={loading}>
            {loading ? "Duplicando..." : "Duplicar Curso"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
