/**
 * Quick test to verify ai-grader is working with the updated model.
 * Run with: npx tsx scripts/test-ai-grader.ts
 */
import { gradeAnswer } from "../lib/ai-grader";

async function main() {
  console.log("Probando calificador de IA con modelo actualizado...\n");

  const result = await gradeAnswer(
    "¿Cuál es la importancia de la comunicación efectiva en el trabajo?",
    "La comunicación efectiva es fundamental porque permite coordinar equipos, evitar malentendidos y lograr objetivos comunes. Cuando los colaboradores se comunican bien, mejora la productividad y el ambiente laboral.",
    "La comunicación efectiva es clave para el trabajo en equipo, la resolución de conflictos y el logro de objetivos organizacionales. Facilita la coordinación entre áreas y contribuye a un mejor clima laboral."
  );

  console.log("Resultado:");
  console.log("  Score (calificación):      ", result.score);
  console.log("  Feedback (para el alumno): ", result.feedback);
  console.log("  AI Score (sospecha de IA): ", result.aiScore);
  console.log("  AI Reasoning (para admin): ", result.aiReasoning);

  if (result.score === 0 && result.feedback.includes("Error")) {
    console.error("\n❌ FALLO: El modelo devolvió error y retornó score 0.");
    process.exit(1);
  } else {
    console.log("\n✅ OK: El calificador funcionó correctamente.");
  }
}

main().catch((err) => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
