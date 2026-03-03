"use client";

import { Brain, Users, Zap, Activity, Check } from "lucide-react";

export function EnterpriseFormal() {
  return (
    <div id="enterprise-formal-doc" className="bg-white p-12 max-w-4xl mx-auto font-sans text-slate-900 border border-slate-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-12 border-b-2 border-cursia-blue/10 pb-8">
        <div>
          <h1 className="text-5xl font-bold tracking-tighter mb-2">
            curs<span className="text-cursia-blue">ia</span>
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">
            Entrenamiento inteligente. Impacto medible.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Documento Ejecutivo</p>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Intro */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Propuesta de Transformación Corporativa</h2>
        <p className="text-lg text-slate-600 leading-relaxed">
          Cursia Enterprise ofrece una solución de entrenamiento y evaluación basada en Inteligencia Artificial,
          diseñada para maximizar el potencial de su equipo con contenido personalizado y seguimiento en tiempo real.
        </p>
      </div>

      {/* Pilares */}
      <div className="mb-12">
        <h3 className="text-xl font-bold uppercase tracking-wider text-cursia-blue mb-6">Nuestros 3 Pilares</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Users className="w-8 h-8 text-cursia-blue mb-3" />
            <h4 className="font-bold mb-2">Personalización</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Contenido a la medida de su realidad operativa y cultura organizacional.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Brain className="w-8 h-8 text-cursia-blue mb-3" />
            <h4 className="font-bold mb-2">Inteligencia Artificial</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Tutoría 24/7 y generación de rutas de aprendizaje en tiempo récord.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Activity className="w-8 h-8 text-cursia-blue mb-3" />
            <h4 className="font-bold mb-2">Seguimiento</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Medición real del impacto y verificación de comprensión profunda.</p>
          </div>
        </div>
      </div>

      {/* Características Detalladas */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="font-bold text-slate-800 mb-4 border-l-4 border-cursia-blue pl-3">Capacitación Especializada</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-cursia-blue shrink-0 mt-0.5" /> Transformación de manuales técnicos en experiencias interactivas.</li>
            <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-cursia-blue shrink-0 mt-0.5" /> Casos reales adaptados a los retos específicos de su industria.</li>
            <li className="flex gap-2 items-start"><Check className="w-4 h-4 text-cursia-blue shrink-0 mt-0.5" /> Alineación total con el lenguaje y valores de su marca.</li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 mb-4 border-l-4 border-cursia-blue pl-3">Evaluación Inteligente</h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex gap-2 items-start"><Zap className="w-4 h-4 text-cursia-blue shrink-0 mt-0.5" /> Evaluaciones de respuesta abierta procesadas por IA.</li>
            <li className="flex gap-2 items-start"><Zap className="w-4 h-4 text-cursia-blue shrink-0 mt-0.5" /> Detección de uso de IA en respuestas para garantizar autenticidad.</li>
            <li className="flex gap-2 items-start"><Zap className="w-4 h-4 text-cursia-blue shrink-0 mt-0.5" /> Feedback detallado y profundo para cada colaborador.</li>
          </ul>
        </div>
      </div>

      {/* Diagnóstico Gratuito */}
      <div className="bg-cursia-blue/5 p-8 rounded-3xl border border-cursia-blue/10 mb-12">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Diagnóstico sin Costo</h3>
          <span className="bg-cursia-blue text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Garantía de Mejora</span>
        </div>
        <p className="text-slate-600 text-sm mb-4">
          Realice una evaluación inicial para medir el nivel real de su equipo. Si el promedio es inferior al 60%,
          otorgamos un **50% de descuento** en el curso especializado para cerrar esa brecha.
        </p>
      </div>

      {/* Modelos de Inversión */}
      <div>
        <h3 className="text-xl font-bold uppercase tracking-wider text-cursia-blue mb-6">Modelos de Implementación</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { level: "01", title: "Proyecto Puntual", courses: "1 Curso", setup: "$1,198", promo: "$599", users: "Hasta 50" },
            { level: "02", title: "Desarrollo Equipo", courses: "3 Cursos", setup: "$2,798", promo: "$1,399", users: "Hasta 150" },
            { level: "03", title: "Plan de Escala", courses: "7 Cursos", setup: "$5,598", promo: "$2,799", users: "Hasta 500" },
          ].map((plan, i) => (
            <div key={i} className="p-5 border border-slate-200 rounded-2xl">
              <p className="text-xs font-bold text-slate-400">NIVEL {plan.level}</p>
              <h4 className="font-bold text-slate-800 text-sm mb-1">{plan.title}</h4>
              <p className="text-xs text-slate-500 mb-4">{plan.courses}</p>
              <div className="mb-4">
                <p className="text-[10px] text-slate-400 line-through">{plan.setup} USD</p>
                <p className="text-xl font-black text-cursia-blue">{plan.promo} <span className="text-xs font-bold">USD</span></p>
              </div>
              <div className="text-[10px] py-2 bg-slate-50 rounded text-center font-bold text-slate-600">
                {plan.users} LICENCIAS
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Contact */}
      <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase">
        <p>© {new Date().getFullYear()} Cursia S.A.S.</p>
        <p>www.cursia.online</p>
      </div>
    </div>
  );
}
