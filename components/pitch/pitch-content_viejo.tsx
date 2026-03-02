"use client";

import {
  Brain, Globe, Clock, ShieldCheck, Activity, Users,
  Zap, Award, Search, History, Database, Lock,
  DollarSign, Cloud, FilePlus, Server, BarChart3, GraduationCap,
  Check, Eye, MessageCircle, AlertTriangle, FileText, PieChart, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export const COVER_SLIDE = {
  id: "cover",
  content: (
    <div className="flex flex-col items-center justify-center h-full text-center z-10 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-9xl font-semibold tracking-tighter text-black">
          curs<span className="text-cursia-blue">ia</span>
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-4xl font-light text-gray-500 tracking-widest uppercase mb-12"
      >
        Entrenamiento inteligente. Impacto medible.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-4 text-gray-400 font-medium"
      >
        <div className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cursia-blue" /> Red Global de Expertos
        </div>
        <div className="px-4 py-2 bg-gray-50 rounded-full border border-gray-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cursia-blue" /> Implementación Rápida
        </div>
      </motion.div>
    </div>
  ),
};

export const CLOSING_SLIDE = {
  id: "closing",
  content: (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-12 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl -z-10 opacity-50" />

      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-8xl font-bold text-gray-900 tracking-tight"
      >
        Gracias
      </motion.h2>
      <p className="text-3xl text-gray-500 max-w-4xl leading-relaxed">
        "Transformamos el conocimiento de su equipo en <span className="text-gray-900 font-semibold underline decoration-cursia-blue decoration-4 underline-offset-4">resultados reales</span>."
      </p>
      <div className="flex gap-4 pt-8">
        <button className="px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:scale-105 transition-transform">
          Agendar Reunión
        </button>
        <button className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 rounded-full font-bold text-lg hover:border-gray-900 transition-colors">
          Ver Demo
        </button>
      </div>
    </div>
  )
};

export const PILARES_SLIDE = {
  title: "Nuestros 3 Pilares",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      <h2 className="text-6xl font-bold text-gray-900 tracking-tight mb-16 text-center">Estrategia de Transformación</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4 text-center items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-4">
            <Users className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Personalización</h3>
          <p className="text-gray-500 text-lg leading-relaxed">Contenido hecho a la medida de tu realidad operativa y cultura organizacional.</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4 text-center items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-4">
            <Brain className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Inteligencia Artificial</h3>
          <p className="text-gray-500 text-lg leading-relaxed">Tutoría 24/7 y generación de rutas de aprendizaje en tiempos récord.</p>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col gap-4 text-center items-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-4">
            <Activity className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Seguimiento</h3>
          <p className="text-gray-500 text-lg leading-relaxed">Medición real del impacto y verificación de comprensión profunda.</p>
        </motion.div>
      </div>
    </div>
  )
};

export const PERSONALIZACION_SLIDE = {
  title: "1. Personalización",
  bullets: [
    { text: "Cursos desde Manuales: Transformamos tus documentos técnicos y manuales operativos en experiencias de aprendizaje.", icon: Check, color: "text-cursia-blue" },
    { text: "Casos Reales: Situaciones de TU empresa, no ejemplos genéricos de internet.", icon: Check, color: "text-cursia-blue" },
    { text: "Identidad Corporativa: Alineación total con el lenguaje y valores de tu marca.", icon: Check, color: "text-cursia-blue" },
    { text: "Nicho Específico: Expertos que entienden los desafíos técnicos de tu industria.", icon: Check, color: "text-cursia-blue" },
  ],
};

export const IA_SLIDE = {
  title: "2. Inteligencia Artificial",
  bullets: [
    { text: "Más que Quizzes: Superamos las preguntas de opción múltiple con evaluaciones de respuesta abierta.", icon: Zap, color: "text-cursia-blue" },
    { text: "Tutor 24/7: Un coach inteligente que resuelve dudas técnicas al instante.", icon: Zap, color: "text-cursia-blue" },
    { text: "Generación Ágil: Estructuración de cursos complejos en días, no meses.", icon: Zap, color: "text-cursia-blue" },
    { text: "Detección de IA en respuestas: Verificamos la autoría y el pensamiento crítico de los colaboradores.", icon: ShieldCheck, color: "text-cursia-blue" },
  ],
};

export const SEGUIMIENTO_SLIDE = {
  title: "3. Seguimiento",
  bullets: [
    { text: "Dashboard de Manager: Seguimiento personalizado para tener el control total del progreso.", icon: Users, color: "text-cursia-blue" },
    { text: "Actualización en Vivo: Monitoreo en tiempo real del desempeño de cada empleado.", icon: Activity, color: "text-cursia-blue" },
    { text: "Retroalimentación Absoluta: Feedback detallado y profundo en cada evaluación final.", icon: Check, color: "text-cursia-blue" },
  ],
};

export const PLANS_SLIDE = {
  id: "plans",
  title: "Modelos de Implementación",
  content: (
    <div className="w-full h-full flex flex-col justify-center">
      <h2 className="text-5xl font-bold text-gray-900 tracking-tight mb-12 text-center">Modelos de Implementación</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
        {/* Plan 1 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-8 border border-gray-200 rounded-3xl shadow-xl bg-white flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-sm">
            -50% OFF
          </div>
          <div className="mb-6 h-32 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900">Nivel 01</h3>
            <p className="text-lg text-cursia-blue font-semibold">Proyecto Puntual</p>
            <p className="text-lg text-gray-600 mt-2">1 Curso</p>
          </div>

          <div className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">Antes</p>
              <p className="text-xl text-gray-400 line-through font-medium mb-2">$1,198 USD</p>
              <div className="w-16 h-0.5 bg-gray-200 mx-auto mb-4"></div>

              <p className="text-lg text-gray-900 font-bold uppercase tracking-wide mb-0">Ahora</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-gray-900">599</span>
                <span className="text-lg text-gray-500 font-medium">USD</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-gray-900 font-medium text-lg">Licencias Incluidas</span>
              <div className="flex flex-col items-end">
                <span className="text-cursia-blue font-bold text-2xl">Hasta 50</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-8 py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors">
            Cotizar Proyecto
          </button>
        </motion.div>

        {/* Plan 2 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-8 border-2 border-cursia-blue rounded-3xl shadow-2xl bg-white relative overflow-hidden flex flex-col h-full transform scale-105 z-10"
        >
          <div className="absolute top-0 right-0 bg-cursia-blue text-white text-xs px-4 py-2 rounded-bl-2xl font-bold tracking-widest uppercase shadow-sm">Recomendado</div>
          <div className="absolute top-12 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-l-full shadow-sm">
            -50% DESC
          </div>

          <div className="mb-6 h-32 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900">Nivel 02</h3>
            <p className="text-lg text-cursia-blue font-semibold">Desarrollo Equipo</p>
            <p className="text-lg text-gray-600 mt-2">3 Cursos</p>
          </div>

          <div className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="text-center py-6 bg-blue-50/50 rounded-2xl border border-blue-100">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">Precio Regular</p>
              <p className="text-xl text-gray-400 line-through font-medium mb-2">$2,798 USD</p>
              <div className="w-16 h-0.5 bg-blue-200 mx-auto mb-4"></div>

              <p className="text-lg text-cursia-blue font-bold uppercase tracking-wide mb-0">Oferta Limitada</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-black text-cursia-blue">1,399</span>
                <span className="text-lg text-gray-500 font-medium">USD</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-gray-900 font-medium text-lg">Licencias Incluidas</span>
              <div className="flex flex-col items-end">
                <span className="text-cursia-blue font-bold text-2xl">Hasta 150</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-8 py-3 rounded-xl bg-cursia-blue text-white font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200">
            Iniciar Alianza
          </button>
        </motion.div>

        {/* Plan 3 */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-8 border border-gray-200 rounded-3xl shadow-xl bg-white flex flex-col h-full relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-sm">
            -50% OFF
          </div>
          <div className="mb-6 h-32 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-gray-900">Nivel 03</h3>
            <p className="text-lg text-cursia-blue font-semibold">Plan de Escala</p>
            <p className="text-lg text-gray-600 mt-2">7 Cursos</p>
          </div>

          <div className="space-y-6 flex-grow flex flex-col justify-between">
            <div className="text-center py-6 bg-blue-50/30 rounded-2xl border border-blue-100">
              <p className="text-sm text-gray-400 font-medium uppercase tracking-wide mb-1">Precio de Lista</p>
              <p className="text-xl text-gray-400 line-through font-medium mb-2">$5,598 USD</p>
              <div className="w-16 h-0.5 bg-blue-200 mx-auto mb-4"></div>

              <p className="text-lg text-gray-900 font-bold uppercase tracking-wide mb-0">Precio Especial</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-black text-cursia-blue">2,799</span>
                <span className="text-lg text-gray-500 font-medium">USD</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-gray-900 font-medium text-lg text-sm">Licencias Incluidas</span>
              <div className="flex flex-col items-end">
                <span className="text-cursia-blue font-bold text-2xl">Hasta 500</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-8 py-3 rounded-xl bg-gray-100 text-gray-900 font-bold hover:bg-gray-200 transition-colors">
            Iniciar Plan Escala
          </button>
        </motion.div>
      </div>
    </div>
  )
};

export const AGENTE_CURSIA_SLIDE = {
  id: "agente-cursia",
  title: "Agente Cursia: Inteligencia a tu Medida",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-12 mb-16">
        <div className="flex-1">
          <h2 className="text-6xl font-bold text-gray-900 tracking-tight mb-6">
            Agente <span className="text-cursia-blue">Cursia</span>
          </h2>
          <p className="text-3xl text-gray-500 leading-relaxed">
            Un desarrollo personalizado que permite crear un agente con toda la información de su empresa.
          </p>
        </div>
        <div className="flex-1 flex justify-center">
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-64 h-64 bg-gradient-to-br from-cursia-blue/10 to-blue-50 rounded-3xl border border-blue-100 flex items-center justify-center relative shadow-2xl shadow-blue-100"
          >
            <Brain className="w-32 h-32 text-cursia-blue" />
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <Search className="w-8 h-8 text-cursia-blue" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
              <Lock className="w-8 h-8 text-cursia-blue" />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Búsqueda Referenciada", desc: "Encuentra información exacta citando los documentos originales.", icon: Search },
          { title: "Trazabilidad Total", desc: "Historial completo de consultas y fuentes utilizadas.", icon: History },
          { title: "Seguridad Enterprise", desc: "Sus datos nunca salen de su entorno seguro corporativo.", icon: Lock },
          { title: "Know-How Propio", desc: "Alimentado exclusivamente con la base de conocimiento de su empresa.", icon: Database },
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + (idx * 0.1) }}
            className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-cursia-blue mb-4">
              <feature.icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
            <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
};

export const AGENTE_CURSIA_PRICING_SLIDE = {
  id: "agente-cursia-pricing",
  title: "Inversión Agente Cursia",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto space-y-12">
      <h2 className="text-6xl font-bold text-gray-900 tracking-tight text-center mb-4">Inversión Agente Cursia</h2>

      <div className="flex justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full max-w-2xl bg-white p-12 rounded-[2.5rem] shadow-2xl border-2 border-gray-900 relative overflow-hidden"
        >
          <div className="absolute top-6 right-6 bg-red-600 text-white text-sm font-black px-4 py-2 rounded-full shadow-lg border-2 border-white animate-pulse">
            OFERTA LANZAMIENTO -50% OFF
          </div>

          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 bg-gray-900 rounded-3xl flex items-center justify-center text-white shadow-xl">
              <DollarSign className="w-12 h-12" />
            </div>

            <div className="flex-1 text-center md:text-left">
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Desarrollo Inicial</h3>
              <p className="text-xl text-gray-500 font-medium">Personalización total de su agente y carga de base de conocimiento inicial.</p>
            </div>

            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-10 min-w-[200px]">
              <p className="text-lg text-gray-400 line-through font-bold mb-1">$2,998 USD</p>
              <div className="flex items-baseline gap-2 justify-center md:justify-end">
                <span className="text-7xl font-black text-gray-900">1,499</span>
                <span className="text-xl text-gray-500 font-bold">USD</span>
              </div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mt-3">Pago Único</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col items-center">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Seleccione su Plan de Mantenimiento</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue">
              <Cloud className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-gray-900">Mantenimiento Básico</h4>
              <p className="text-sm text-gray-500">Hosting, Dominio y SSL.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-cursia-blue">120</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase">USD / MES</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-blue-600 p-8 rounded-3xl shadow-xl border border-blue-400 flex items-center gap-6 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-white/20 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl">Full Service</div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white">
              <FilePlus className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold">Mantenimiento Full</h4>
              <p className="text-sm text-blue-100">Carga de documentos ilimitada.</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">149</p>
              <p className="text-[10px] font-bold text-blue-200 uppercase">USD / MES</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
};

export const COMPORTAMIENTO_CONFIDENZA_SLIDE = {
  id: "comportamiento",
  title: "Inteligencia que Aprende y Evalúa",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-10">
          <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Análisis Inteligente de <span className="text-cursia-blue">Comportamiento</span>
          </h2>
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-cursia-blue shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Detección de Ambigüedad</h4>
                <p className="text-gray-500">Identificamos cuando el contenido no es claro para el empleado o cuando falta información crítica.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-cursia-blue shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Porcentaje de Confianza</h4>
                <p className="text-gray-500">Cada respuesta incluye un nivel de certeza basado en la precisión de los datos originales.</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-cursia-blue shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">Soporte Inteligente</h4>
                <p className="text-gray-500">Si no hay datos específicos, el sistema avisa que usará respuestas generales para evitar confusiones.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-cursia-blue"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-400 uppercase">Nivel de Confianza</span>
                <span className="text-2xl font-black text-cursia-blue">85%</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl text-gray-500 italic text-lg leading-relaxed border-l-4 border-cursia-blue">
                "Analizando patrones de consulta..."
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
};

export const ANALISIS_DATOS_SLIDE = {
  id: "analisis-datos",
  title: "Decisiones Basadas en Datos",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      <h2 className="text-6xl font-black text-gray-900 tracking-tighter text-center mb-4 uppercase">
        Transformamos Consultas en <span className="text-cursia-blue">Estrategia</span>
      </h2>
      <p className="text-2xl text-gray-500 text-center mb-16 max-w-3xl mx-auto">
        Descubrimos qué está pasando dentro de tu empresa a través de las dudas de tu equipo.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col gap-4">
          <PieChart className="w-8 h-8 text-cursia-blue" />
          <h4 className="text-xl font-bold">Diagnóstico de Brechas</h4>
          <ul className="text-sm text-gray-500 space-y-3">
            <li>• Preguntas más frecuentes</li>
            <li>• Preguntas sin respuesta correcta</li>
            <li>• Contenidos más ambiguos</li>
          </ul>
        </div>
        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col gap-4">
          <FileText className="w-8 h-8 text-cursia-blue" />
          <h4 className="text-xl font-bold">Impacto del Conocimiento</h4>
          <ul className="text-sm text-gray-500 space-y-3">
            <li>• Documentos más consultados</li>
            <li>• Volumen de dudas mensuales</li>
            <li>• Áreas con mayor necesidad de refuerzo</li>
          </ul>
        </div>
        <div className="p-8 bg-cursia-blue text-white rounded-3xl shadow-xl flex flex-col gap-4 justify-center">
          <TrendingUp className="w-10 h-10" />
          <h3 className="text-2xl font-black uppercase leading-tight">Plan de Mejora Personalizado</h3>
          <p className="text-blue-100">Creamos la solución exacta para cerrar los huecos de información detectados.</p>
        </div>
      </div>
    </div>
  )
};

export const LA_BOMBA_OFFER_SLIDE = {
  id: "la-bomba",
  title: "Una Propuesta sin Precedentes",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-12"
      >
        <h2 className="text-9xl font-black text-gray-900 tracking-tighter uppercase italic leading-[0.8] mb-4">
          100% <span className="text-cursia-blue">Gratis</span>
        </h2>
        <p className="text-4xl font-bold text-gray-400 tracking-widest uppercase mb-12">Usuarios Ilimitados</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
        <div className="text-left space-y-6">
          <div className="p-6 bg-white shadow-xl rounded-3xl border border-gray-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold">Todo tu equipo</h4>
              <p className="text-gray-500">Sin límites de acceso durante 1 mes.</p>
            </div>
          </div>
          <div className="p-6 bg-white shadow-xl rounded-3xl border border-gray-100 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold">Diagnóstico de Regalo</h4>
              <p className="text-gray-500">Reunión estratégica si superas el 80% de uso.</p>
            </div>
          </div>
        </div>

        <motion.div
          whileHover={{ rotate: 1 }}
          className="bg-cursia-blue p-12 rounded-[3.5rem] shadow-2xl shadow-blue-200 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full" />
          <h3 className="text-3xl font-black uppercase mb-6 leading-tight">Comienza Hoy Mismo</h3>
          <p className="text-blue-50 mb-8 text-lg">Prueba el poder de tu propia información sin inversión inicial.</p>
          <button className="w-full py-5 bg-white text-cursia-blue font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform shadow-lg">
            Activar Agente Gratis
          </button>
        </motion.div>
      </div>
    </div>
  )
};

export const QUIZ_GRATUITO_SLIDE = {
  id: "quiz-gratuito",
  title: "Diagnóstico sin Costo",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto px-4">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-block px-5 py-1.5 bg-blue-50 text-cursia-blue rounded-full font-bold text-xs tracking-widest uppercase mb-4"
        >
          Herramienta de Evaluación IA
        </motion.div>
        <h2 className="text-6xl font-bold text-gray-900 tracking-tight uppercase mb-4">
          Mide el <span className="text-cursia-blue">Nivel Real</span> de tu equipo
        </h2>
        <p className="text-xl text-gray-500 font-medium max-w-3xl mx-auto">
          Un diagnóstico inteligente que entiende la lógica profunda detrás de cada respuesta.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div whileHover={{ y: -8 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col text-center items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-6">
            <Zap className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">Detección de IA</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Identificamos respuestas generadas por bots, garantizando la autenticidad.</p>
        </motion.div>

        <motion.div whileHover={{ y: -8 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col text-center items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-6">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">Razonamiento</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Evaluamos la lógica y comprensión profunda, no solo el acierto.</p>
        </motion.div>

        <motion.div whileHover={{ y: -8 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col text-center items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-6">
            <Activity className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">Feedback Vivo</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Retroalimentación personalizada instantánea para cada colaborador.</p>
        </motion.div>

        <motion.div whileHover={{ y: -8 }} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col text-center items-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-cursia-blue mb-6">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 uppercase mb-3">Monitoreo Admin</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Panel de control total para supervisar el avance y resultados grupales.</p>
        </motion.div>
      </div>

      <div className="mt-12 text-center">
        <button className="px-10 py-5 bg-cursia-blue text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl shadow-blue-100">
          Lanzar Quiz Gratuito
        </button>
      </div>
    </div>
  )
};

export const QUIZ_BENEFICIO_SLIDE = {
  id: "quiz-beneficio",
  title: "Garantía de Mejora",
  content: (
    <div className="w-full h-full flex flex-col justify-center items-center max-w-5xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-6xl font-bold text-gray-900 tracking-tight uppercase mb-4">
          Tu éxito está <span className="text-cursia-blue">Garantizado</span>
        </h2>
        <p className="text-xl text-gray-500 font-medium max-w-3xl mx-auto">
          Si el diagnóstico detecta brechas críticas, te ayudamos a cerrarlas de inmediato con un beneficio exclusivo.
        </p>
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-blue-100 relative max-w-3xl w-full text-center"
      >
        <div className="absolute top-4 right-8 bg-blue-50 text-cursia-blue text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest border border-blue-100">
          Incentivo Especial
        </div>

        <p className="text-2xl font-bold text-gray-800 mb-8 leading-relaxed">
          Si el promedio obtenido es **menor al 60%**, aplicamos automáticamente un:
        </p>

        <div className="bg-blue-50/50 py-10 rounded-[2rem] border border-blue-100 mb-8">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-9xl font-black text-gray-900">50</span>
            <span className="text-5xl font-black text-cursia-blue">%</span>
          </div>
          <p className="text-2xl font-black text-cursia-blue uppercase tracking-[0.2em] mt-2">Descuento Directo</p>
        </div>

        <p className="text-lg text-gray-500 font-medium">
          Válido para el curso especializado sobre el tema evaluado para todo tu equipo.
        </p>
      </motion.div>
    </div>
  )
};

export const PLAN_MEJORA_SLIDE = {
  id: "plan-mejora",
  title: "Plan de Mejora Continua",
  content: (
    <div className="w-full h-full flex flex-col justify-center max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-6xl font-black text-gray-900 tracking-tighter uppercase italic">
          Potencia el <span className="text-cursia-blue">Impacto</span>
        </h2>
        <p className="text-2xl text-gray-500 mt-4 max-w-3xl mx-auto">
          Detectamos brechas críticas y las cerramos con tecnología y conocimiento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <motion.div
          whileHover={{ y: -10 }}
          className="p-10 border-2 border-gray-100 rounded-[3rem] bg-white flex flex-col shadow-xl"
        >
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Mejora Mensual</h3>
            <p className="text-gray-500">Agente full optimizado basado en el diagnóstico inicial.</p>
          </div>
          <div className="mb-10 flex items-baseline gap-2">
            <span className="text-7xl font-black text-gray-900">250</span>
            <span className="text-xl text-gray-500 font-bold">USD / MES</span>
          </div>
          <ul className="space-y-4 mb-10 flex-grow">
            <li className="flex items-center gap-3"><Check className="text-cursia-blue w-5 h-5" /> Optimización de Base de Datos</li>
            <li className="flex items-center gap-3"><Check className="text-cursia-blue w-5 h-5" /> Mejoras de Seguridad</li>
            <li className="flex items-center gap-3"><Check className="text-cursia-blue w-5 h-5" /> Soporte Prioritario</li>
          </ul>
          <button className="w-full py-4 rounded-2xl border-2 border-gray-900 text-gray-900 font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all">
            Suscripción Mensual
          </button>
        </motion.div>

        <motion.div
          whileHover={{ y: -10 }}
          className="p-10 border-4 border-cursia-blue rounded-[3rem] bg-white flex flex-col shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 bg-cursia-blue text-white px-6 py-2 font-black uppercase text-sm rounded-bl-3xl tracking-widest animate-pulse">
            Máximo Valor
          </div>
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Plan de Crecimiento Anual</h3>
            <p className="text-gray-500 font-medium">La solución definitiva para el conocimiento de tu empresa.</p>
          </div>
          <div className="mb-6 flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-7xl font-black text-cursia-blue">1,999</span>
              <span className="text-xl text-gray-400 font-bold uppercase italic">USD / AÑO</span>
            </div>
            <p className="text-sm font-bold text-gray-400 mt-2">AHORRA 1,000 USD VS MENSUAL</p>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8">
            <div className="flex items-center gap-4 mb-3">
              <GraduationCap className="text-cursia-blue w-8 h-8" />
              <h4 className="font-black text-gray-900 uppercase text-lg">Bonus Exclusivo</h4>
            </div>
            <p className="text-gray-700 font-medium">2 Cursos enfocados específicamente en las áreas de mayor deficiencia detectadas en el diagnóstico.</p>
          </div>

          <button className="w-full py-5 rounded-2xl bg-cursia-blue text-white font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-blue-200">
            Tomar Plan Anual
          </button>
        </motion.div>
      </div>
    </div>
  )
};

export const ENTERPRISE_PITCH_SLIDES = [
  COVER_SLIDE,
  PILARES_SLIDE,
  IA_SLIDE,
  ANALISIS_DATOS_SLIDE,
  PLANS_SLIDE,
  CLOSING_SLIDE,
];

export const ADDITIONAL_PITCH_SLIDES = [
  COVER_SLIDE,
  AGENTE_CURSIA_SLIDE,
  COMPORTAMIENTO_CONFIDENZA_SLIDE,
  QUIZ_GRATUITO_SLIDE,
  QUIZ_BENEFICIO_SLIDE,
  AGENTE_CURSIA_PRICING_SLIDE,
  PLAN_MEJORA_SLIDE,
  LA_BOMBA_OFFER_SLIDE,
  CLOSING_SLIDE,
];

