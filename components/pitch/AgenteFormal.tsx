"use client";

import { Brain, Search, Lock, Database, Eye, TrendingUp, AlertTriangle, PieChart, FileText, Check, GraduationCap } from "lucide-react";

export function AgenteFormal() {
  return (
    <div id="agente-formal-doc" className="bg-white p-10 max-w-4xl mx-auto font-sans text-slate-900 border border-slate-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-cursia-blue/10 pb-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-1">
            curs<span className="text-cursia-blue">ia</span>
          </h1>
          <p className="text-slate-500 font-medium uppercase tracking-widest text-[10px]">
            Inteligencia a su medida. Seguridad Enterprise.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dossier Técnico: Agente Cursia</p>
          <p className="text-[10px] text-slate-500">{new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Intro section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-3">Agente Cursia: Su Base de Conocimiento Inteligente</h2>
        <p className="text-base text-slate-600 leading-relaxed">
          El Agente Cursia es un desarrollo a medida que integra toda la información de su empresa en un ecosistema seguro,
          permitiendo consultas precisas, trazabilidad total y un análisis profundo del comportamiento de sus colaboradores.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Search className="w-5 h-5 text-cursia-blue" />
            <h4 className="font-bold text-sm">Búsqueda Referenciada</h4>
          </div>
          <p className="text-xs text-slate-600">Encuentra información exacta citando los documentos originales, garantizando veracidad absoluta en cada respuesta.</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-cursia-blue" />
            <h4 className="font-bold text-sm">Seguridad Enterprise</h4>
          </div>
          <p className="text-xs text-slate-600">Sus datos residen exclusivamente en su entorno seguro. El Agente aprende solo de su base de conocimiento propia.</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-5 h-5 text-cursia-blue" />
            <h4 className="font-bold text-sm">Detección de Ambigüedad</h4>
          </div>
          <p className="text-xs text-slate-600">Identificamos brechas en la documentación cuando el sistema detecta consultas recurrentes sin respuestas claras.</p>
        </div>
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-cursia-blue" />
            <h4 className="font-bold text-sm">Análisis de Confianza</h4>
          </div>
          <p className="text-xs text-slate-600">Cada interacción incluye un porcentaje de certeza basado en la precisión de las fuentes consultadas.</p>
        </div>
      </div>

      {/* Data Decisions */}
      <div className="mb-8">
        <h3 className="text-lg font-bold uppercase tracking-wider text-cursia-blue mb-4">Decisiones Basadas en Datos</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <PieChart className="w-4 h-4 text-cursia-blue" />
            <h4 className="font-bold text-xs">Diagnóstico de Brechas</h4>
            <p className="text-[10px] text-slate-500">Dudas más frecuentes y áreas de confusión.</p>
          </div>
          <div className="space-y-1">
            <FileText className="w-4 h-4 text-cursia-blue" />
            <h4 className="font-bold text-xs">Impacto del Saber</h4>
            <p className="text-[10px] text-slate-500">Volumen de dudas y documentos consultados.</p>
          </div>
          <div className="space-y-1">
            <TrendingUp className="w-4 h-4 text-cursia-blue" />
            <h4 className="font-bold text-xs">Plan de Mejora</h4>
            <p className="text-[10px] text-slate-500">Estrategias para cerrar huecos de información.</p>
          </div>
        </div>
      </div>

      {/* Offer Case */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl mb-8 flex justify-between items-center">
        <div className="max-w-xs">
          <h3 className="text-2xl font-black uppercase italic mb-2">100% GRATIS</h3>
          <p className="text-slate-300 text-[10px]">
            Pruebe el poder de su información con usuarios ilimitados durante 1 mes.
          </p>
        </div>
        <div className="bg-white/10 p-4 rounded-xl text-center border border-white/10">
          <p className="text-[8px] font-bold tracking-widest uppercase mb-1">Promo Lanzamiento</p>
          <p className="text-xl font-black text-cursia-blue">$0 USD</p>
        </div>
      </div>

      {/* Artificial Gap for Page Break - Increased to ensure no cutoff */}
      <div className="h-64" />

      {/* Investment Plans - Page 2 */}
      <div className="mb-8 pt-20">
        <h3 className="text-2xl font-black uppercase tracking-widest text-cursia-blue mb-12 text-center">Inversión y Mantenimiento</h3>
        <div className="grid grid-cols-2 gap-10">
          {/* Plan Mensual */}
          <div className="p-8 border-2 border-slate-100 rounded-[2.5rem] bg-white shadow-sm flex flex-col">
            <div className="mb-6">
              <h4 className="text-xl font-bold text-slate-900">Mejora Mensual</h4>
              <p className="text-xs text-slate-500">Optimización y soporte estratégico.</p>
            </div>
            <div className="mb-8 flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900">250</span>
              <span className="text-sm font-bold text-slate-400">USD / MES</span>
            </div>
            <ul className="space-y-4 text-[11px] text-slate-600 flex-grow">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Cambios en Base de Datos</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Reuniones de Seguimiento</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Analítica de Datos</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Soporte Prioritario</li>
            </ul>
          </div>

          {/* Plan Anual */}
          <div className="p-8 border-4 border-cursia-blue rounded-[3rem] bg-white shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 bg-cursia-blue text-white px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
              Máximo Valor
            </div>
            <div className="mb-6">
              <h4 className="text-xl font-bold text-slate-900">Plan Anual</h4>
              <p className="text-xs text-slate-500 font-medium">Solución definitiva de conocimiento.</p>
            </div>
            <div className="mb-6 flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-cursia-blue">1,999</span>
                <span className="text-sm font-bold text-slate-400">USD / AÑO</span>
              </div>
              <div className="mt-2 inline-block bg-cursia-blue/10 px-3 py-1 rounded-full">
                <p className="text-[9px] font-black text-cursia-blue uppercase tracking-tight">Ahorra $1,000 USD vs mensual</p>
              </div>
            </div>

            <ul className="space-y-3 text-[11px] text-slate-600 mb-6">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Cambios en Base de Datos</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Reuniones de Seguimiento</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Analítica de Datos</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-cursia-blue" /> Soporte Prioritario</li>
            </ul>

            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-6 h-6 text-cursia-blue" />
                <h5 className="font-black text-slate-900 uppercase text-xs">Beneficio Adicional</h5>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-bold">
                Incluye **2 cursos adicionales** de mejora para tu equipo.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-widest uppercase text-center">
        <p>© {new Date().getFullYear()} Cursia S.A.S.</p>
        <p>www.cursia.online</p>
      </div>
    </div>
  );
}
