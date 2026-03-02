"use client";

import { ExternalLink } from "lucide-react";

export function AssessmentCopyLink({ assessmentId }: { assessmentId: string }) {
  return (
    <button
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-accent hover:text-accent-foreground h-9 w-9"
      title="Copiar link público"
      onClick={() => {
        const url = `${window.location.origin}/assessment/${assessmentId}`;
        navigator.clipboard.writeText(url);
        alert("Link copiado: " + url);
      }}
    >
      <ExternalLink className="w-4 h-4" />
    </button>
  );
}
