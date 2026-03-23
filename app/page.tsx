"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ArrowRight,
  LogIn,
  Instagram,
  Sparkles,
  BookOpen,
  PieChart,
  Building2,
  Briefcase,
  User,
  Mail,
  Smartphone,
  Send,
  Users,
  CheckCircle2,
  Brain,
  BarChart2,
  Calendar,
  Check,
  Cpu,
} from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    correo: "",
    empresa: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  const [panelZoomed, setPanelZoomed] = useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setShowWhatsAppButton(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitLead = async () => {
    if (!isFormValid || formSubmitting) return;
    setFormSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error("Error al guardar lead:", error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const isFormValid =
    formData.nombre &&
    formData.celular &&
    formData.correo &&
    formData.empresa;

  return (
    <div className="min-h-screen bg-cursia-surface text-cursia-on-surface selection:bg-blue-100 selection:text-blue-900 font-body">

      {/* ── Floating Pill Navbar ── */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-[100] bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_20px_50px_-15px_rgba(0,102,255,0.1)] rounded-full">
        <div className="flex justify-between items-center px-8 py-3 mx-auto">
          <div className="text-2xl font-extrabold tracking-tighter font-headline hover:scale-105 transition-transform cursor-pointer">
            <span className="text-slate-900">Curs</span><span className="text-cursia-blue">ia</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {[
              { label: "Administración", href: "#admin" },
              { label: "Tecnología IA", href: "#ai" },
              { label: "Contacto", href: "#contacto" },
            ].map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="relative font-headline font-semibold text-sm tracking-tight text-slate-600 hover:text-cursia-blue transition-colors group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cursia-blue transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="font-headline font-semibold text-sm text-slate-600 hover:text-cursia-blue transition-all duration-300"
            >
              Acceder
            </Link>
            <a
              href="#contacto"
              className="bg-cursia-blue text-white px-7 py-2.5 rounded-full font-headline font-bold text-sm tracking-tight hover:bg-blue-700 hover:shadow-[0_10px_25px_-5px_rgba(0,80,203,0.4)] hover:-translate-y-0.5 active:scale-95 transform transition-all shadow-lg shadow-blue-500/20"
            >
              Evaluación Gratis
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-32 overflow-hidden">

        {/* ── Hero Section ── */}
        <section className="relative px-8 py-20 lg:py-32">
          {/* Background blobs */}
          <div className="absolute top-0 -left-20 w-[600px] h-[600px] bg-cursia-blue/10 rounded-full blur-[140px] -z-10 animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[140px] -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: text */}
            <div className="relative z-10 space-y-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-cursia-green/10 text-cursia-green rounded-full font-body font-bold text-xs uppercase tracking-widest border border-cursia-green/20">
                <ShieldCheck className="w-4 h-4" />
                Integridad de Datos Garantizada
              </div>

              {/* H1 */}
              <h1 className="text-6xl lg:text-[5.5rem] font-[800] leading-[1.05] tracking-[-0.05em] text-cursia-on-surface font-headline">
                Evalúe a su{" "}
                <span className="bg-gradient-to-r from-cursia-blue to-blue-400 bg-clip-text text-transparent">
                  Equipo
                </span>{" "}
                Gratis.
              </h1>

              {/* Paragraph */}
              <p className="text-xl text-cursia-on-surface-dim max-w-lg font-body leading-relaxed">
                Desbloqueamos el potencial real de su organización con evaluaciones impulsadas por IA, diseñadas para identificar problemas con precisión.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-5">
                <a
                  href="#contacto"
                  className="px-10 py-5 bg-cursia-blue text-white rounded-[1.5rem] font-headline font-bold text-lg hover:shadow-[0_25px_50px_-12px_rgba(0,102,255,0.3)] transition-all flex items-center justify-center gap-2 active:scale-95 transform"
                >
                  Solicitar Diagnóstico
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-8 pt-4 border-t border-slate-200/60">
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-cursia-on-surface tracking-tighter">Gratis</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin compromisos</span>
                </div>
                <div className="w-px h-10 bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-cursia-on-surface tracking-tighter">Récord</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiempos de entrega</span>
                </div>
              </div>
            </div>

            {/* Right: 3-step process card */}
            <div className="relative">
              {/* Glow */}
              <div className="absolute inset-0 bg-cursia-blue/10 rounded-[3rem] blur-3xl -z-10" />

              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200/60 p-8 md:p-10">

                {/* Header */}
                <div className="mb-8">
                  <div className="text-[10px] font-bold text-cursia-blue uppercase tracking-[0.25em] mb-2">Evaluación Gratuita</div>
                  <div className="text-2xl font-extrabold font-headline text-cursia-on-surface">Así de simple.</div>
                </div>

                {/* Steps timeline */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[1.375rem] top-11 bottom-11 w-0.5 bg-gradient-to-b from-cursia-blue/40 via-cursia-blue/20 to-cursia-blue/60 z-0" />

                  <div className="space-y-3 relative z-10">
                    {[
                      {
                        num: "01",
                        icon: <Brain className="w-5 h-5" />,
                        title: "Análisis del tema",
                        tag: "Nosotros lo diseñamos",
                        active: false,
                      },
                      {
                        num: "02",
                        icon: <Users className="w-5 h-5" />,
                        title: "Su equipo responde",
                        tag: "Preguntas abiertas · Sin trampas",
                        active: false,
                      },
                      {
                        num: "03",
                        icon: <BarChart2 className="w-5 h-5" />,
                        title: "Reporte estratégico",
                        tag: "Brechas + recomendaciones",
                        active: true,
                      },
                    ].map(({ num, icon, title, tag, active }) => (
                      <div key={num} className="flex items-center gap-4 group">
                        {/* Icon node */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md transition-transform duration-300 group-hover:scale-110 ${active ? "bg-cursia-blue shadow-blue-500/30" : "bg-cursia-blue/70"}`}>
                          {icon}
                        </div>
                        {/* Content */}
                        <div className={`flex-1 flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md ${active ? "bg-cursia-blue/5 border-cursia-blue/25" : "bg-cursia-surface border-slate-100"}`}>
                          <div>
                            <p className="font-bold text-cursia-on-surface">{title}</p>
                            <p className={`text-xs font-semibold ${active ? "text-cursia-blue" : "text-slate-400"}`}>{tag}</p>
                          </div>
                          <div className="text-[11px] font-black text-slate-200 font-headline pl-3">{num}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 text-xs font-bold text-cursia-green">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Sin costo · Sin compromisos · Tiempo récord
                </div>

              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-5 -right-5 glass-panel p-5 rounded-2xl shadow-xl border border-white animate-float z-20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-cursia-blue rounded-xl flex items-center justify-center text-white">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Calificado por</div>
                    <div className="text-sm font-bold">IA de Cursia</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Value Proposition ── */}
        <section className="py-24 bg-cursia-surface-low">
          <div className="max-w-7xl mx-auto px-6">

            {/* Section header */}
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-cursia-blue/10 text-cursia-blue rounded-full font-body font-bold text-xs uppercase tracking-widest border border-cursia-blue/20 mb-6">
                <BookOpen className="w-4 h-4" />
                Nuestros Cursos
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold font-headline leading-tight text-cursia-on-surface mb-5">
                Cursos que transforman <span className="text-cursia-blue">equipos</span>
              </h2>
              <p className="text-lg text-cursia-on-surface-dim leading-relaxed">
                Cada curso lo creamos desde cero para su empresa. No hay plantillas ni contenido genérico — solo aprendizaje diseñado para que su equipo aplique lo aprendido desde el primer día.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Users className="w-8 h-8" />,
                  title: "Diseñados a su medida",
                  desc: "Cada curso nace de una sesión estratégica donde entendemos su empresa, su cultura y sus metas. El resultado: contenido que resuena con su equipo y genera impacto real.",
                },
                {
                  icon: <Sparkles className="w-8 h-8" />,
                  title: "Acompañamiento constante",
                  desc: "Durante todo el curso, cada empleado cuenta con un asistente de IA disponible 24/7 que resuelve dudas, refuerza conceptos y se adapta al ritmo de cada persona.",
                },
                {
                  icon: <ShieldCheck className="w-8 h-8" />,
                  title: "Evaluaciones que importan",
                  desc: "Nada de opciones múltiples. Evaluamos con preguntas abiertas que la IA califica, garantizando que cada certificado refleje conocimiento genuino, no respuestas memorizadas.",
                },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="group bg-white p-10 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cursia-blue/5"
                >
                  <div className="w-16 h-16 bg-cursia-blue/10 text-cursia-blue rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 font-headline">{title}</h3>
                  <p className="text-cursia-on-surface-dim leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Admin Section ── */}
        <section id="admin" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Dashboard screenshot */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-slate-200/20 rounded-[2rem] -rotate-2 -z-10" />
              <div
                onClick={() => setPanelZoomed(true)}
                className="rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200/60 scale-[1.18] origin-left cursor-zoom-in group transition-all duration-500 hover:shadow-[0_30px_60px_-10px_rgba(0,102,255,0.2)] hover:scale-[1.21] hover:-rotate-1"
              >
                <Image
                  src="/PanelCursia.png"
                  alt="Panel de administración Cursia"
                  width={1200}
                  height={800}
                  className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
                <div className="absolute inset-0 bg-cursia-blue/0 group-hover:bg-cursia-blue/5 transition-all duration-500 rounded-[2rem] flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold text-cursia-blue shadow-lg">
                    Click para ampliar
                  </div>
                </div>
              </div>
            </div>

            {/* Lightbox */}
            {panelZoomed && (
              <div
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out"
                onClick={() => setPanelZoomed(false)}
              >
                <div className="relative max-w-6xl w-full rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <Image
                    src="/PanelCursia.png"
                    alt="Panel de administración Cursia"
                    width={1800}
                    height={1200}
                    className="w-full h-auto"
                  />
                  <button
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center text-slate-700 hover:bg-white transition-all shadow-lg font-bold text-lg"
                    onClick={() => setPanelZoomed(false)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Text content */}
            <div className="space-y-8 lg:pl-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold font-headline leading-tight">
                Gestión Corporativa{" "}
                <span className="text-cursia-blue">Sin Fricción</span>
              </h2>
              <p className="text-lg text-cursia-on-surface-dim leading-relaxed">
                Nuestra consola le da visibilidad completa sobre el avance de cada empleado en su curso — en tiempo real, sin reportes manuales ni depender del área de TI.
              </p>
              <ul className="space-y-6">
                {[
                  {
                    icon: <PieChart className="w-5 h-5" />,
                    title: "Reportes Personalizados",
                    desc: "Vea exactamente en qué módulo del curso está cada empleado y exporte analíticas detalladas con un solo clic.",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    title: "Personalización Total",
                    desc: "Tiempos de capacitación, porcentajes de aprobación y metas configurables según los estándares de su organización.",
                  },
                  {
                    icon: <BarChart2 className="w-5 h-5" />,
                    title: "Monitoreo en Tiempo Real",
                    desc: "Sepa al instante quién está avanzando en el curso, quién se quedó atrás y dónde están las fricciones, sin esperar reportes periódicos.",
                  },
                ].map(({ icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-cursia-blue/10 text-cursia-blue flex items-center justify-center shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{title}</h4>
                      <p className="text-sm text-slate-500">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── AI Technology Section ── */}
        <section id="ai" className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-cursia-blue/5 blur-[150px] -z-0" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">

            {/* Left: text + cards */}
            <div className="order-2 lg:order-1 space-y-8">
              <div className="inline-block px-4 py-1.5 bg-cursia-blue/10 text-cursia-blue rounded-full text-xs font-extrabold uppercase tracking-widest border border-cursia-blue/20">
                Tecnología de Vanguardia
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold font-headline leading-[1.2] text-cursia-on-surface">
                La IA que{" "}
                <span className="text-cursia-blue">Verifica</span> el Talento
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {[
                  {
                    icon: <ShieldCheck className="w-7 h-7" />,
                    title: "Detección de Fraude",
                    desc: "Identificamos cuando un empleado usa herramientas de IA externas para responder evaluaciones. Cada certificación emitida por Cursia refleja conocimiento genuino, no respuestas generadas.",
                  },
                  {
                    icon: <Brain className="w-7 h-7" />,
                    title: "Evaluación Cognitiva",
                    desc: "Más allá de las respuestas, analizamos el proceso de razonamiento para identificar líderes potenciales.",
                  },
                ].map(({ icon, title, desc }) => (
                  <div
                    key={title}
                    className="group bg-white p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-cursia-blue/10"
                  >
                    <div className="w-14 h-14 bg-cursia-blue/10 text-cursia-blue rounded-[1.25rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {icon}
                    </div>
                    <h4 className="text-xl font-bold mb-3 font-headline text-cursia-on-surface">{title}</h4>
                    <p className="text-cursia-on-surface-dim text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Neural Trust circle */}
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <div className="absolute inset-0 bg-cursia-blue/10 rounded-full blur-[100px] animate-pulse" />
                <div className="relative z-10 w-full h-full bg-white border border-slate-200 shadow-xl rounded-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-cursia-blue/5 rounded-full flex items-center justify-center mb-6 ring-1 ring-cursia-blue/20">
                    <Brain className="w-12 h-12 text-cursia-blue animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold font-headline text-slate-900">AI Detection</div>
                    <div className="text-sm text-slate-500 font-medium">Motor de verificación corporativa</div>
                  </div>
                  <div className="mt-8 flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-cursia-blue/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-cursia-blue/60 animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-cursia-blue animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact Section ── */}
        <section id="contacto" className="py-32 bg-cursia-surface-low">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold font-headline mb-4">
                Solicite su Evaluación{" "}
                <span className="text-cursia-blue">Gratuita</span>
              </h2>
              <p className="text-cursia-on-surface-dim max-w-xl mx-auto">
                Complete el formulario y uno de nuestros consultores senior se pondrá en contacto para diseñar su prueba personalizada.
              </p>
            </div>

            <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-2xl shadow-cursia-blue/5">
              {formSubmitted ? (
                <div className="py-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-in fade-in duration-300">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-xl font-bold text-emerald-800">¡Solicitud recibida!</p>
                  <p className="text-sm text-emerald-600 mt-2">
                    Nos ponemos en contacto en menos de 24 horas para diseñar su evaluación.
                  </p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                  {/* Row 1: Nombre + Celular */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Nombre completo
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Ej: Juan Pérez"
                        className="w-full px-6 py-4 bg-cursia-surface rounded-[1rem] border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cursia-blue focus:outline-none transition-all font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5">
                        <Smartphone className="w-3 h-3" /> Celular
                      </label>
                      <input
                        type="tel"
                        name="celular"
                        value={formData.celular}
                        onChange={handleInputChange}
                        placeholder="+57 300 000 0000"
                        className="w-full px-6 py-4 bg-cursia-surface rounded-[1rem] border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cursia-blue focus:outline-none transition-all font-body"
                      />
                    </div>
                  </div>

                  {/* Row 2: Correo + Empresa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> Correo corporativo
                      </label>
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        placeholder="jperez@empresa.com"
                        className="w-full px-6 py-4 bg-cursia-surface rounded-[1rem] border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cursia-blue focus:outline-none transition-all font-body"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-1.5">
                        <Building2 className="w-3 h-3" /> Empresa
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        placeholder="Ej: Mi Empresa S.A.S"
                        className="w-full px-6 py-4 bg-cursia-surface rounded-[1rem] border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-cursia-blue focus:outline-none transition-all font-body"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitLead}
                      disabled={!isFormValid || formSubmitting}
                      className={`w-full py-5 rounded-[1.25rem] font-headline font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                        isFormValid && !formSubmitting
                          ? "bg-cursia-blue text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Send className="w-5 h-5" />
                      {formSubmitting ? "Enviando..." : "Solicitar mi Evaluación Gratuita"}
                    </button>
                  </div>
                </form>
              )}

              {/* WhatsApp */}
              <a
                href="https://wa.me/573246590060"
                target="_blank"
                rel="noreferrer"
                className="mt-6 flex items-center gap-5 p-5 rounded-[1.25rem] bg-cursia-surface border border-slate-200 hover:shadow-md hover:border-green-200 transition-all group"
              >
                <div className="w-12 h-12 rounded-[0.875rem] bg-[#25D366] flex items-center justify-center text-white shrink-0">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">¿Prefiere escribirnos directamente?</p>
                  <p className="text-sm text-slate-500">Respuesta inmediata por WhatsApp</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
              </a>
            </div>

            {/* Instagram */}
            <div className="max-w-2xl mx-auto w-full mt-16 pt-16 border-t border-slate-200/60">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white shrink-0 shadow-lg shadow-pink-500/20">
                  <Instagram className="w-10 h-10" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Síguenos en Instagram</p>
                  <p className="text-2xl font-extrabold text-slate-900 mb-2">@cursia.online</p>
                  <p className="text-slate-500 text-base leading-relaxed">
                    Casos de uso reales, consejos sobre capacitación corporativa con IA y novedades de la plataforma. Contenido pensado para líderes de equipos.
                  </p>
                </div>
                <a
                  href="https://instagram.com/cursia.online"
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-[1rem] border-2 border-pink-200 text-pink-600 font-bold hover:bg-pink-50 transition-all"
                >
                  Ver perfil <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="bg-slate-50 w-full py-12 border-t border-slate-200/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
          <div className="text-xl font-bold font-headline">
            <span className="text-slate-900">Curs</span><span className="text-cursia-blue">ia</span>
          </div>
          <div className="flex gap-8">
            <a href="https://instagram.com/cursia.online" className="font-body text-sm text-slate-500 hover:text-cursia-blue transition-colors">Instagram</a>
          </div>
          <p className="font-body text-sm text-slate-500">© 2026 Cursia for Enterprise.</p>
        </div>
      </footer>

      {/* ── Floating WhatsApp Button ── */}
      {showWhatsAppButton && (
        <a
          href="https://wa.me/573246590060"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-8 right-8 w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#25D366]/50 hover:scale-110 active:scale-95 transition-all z-[60] animate-in fade-in duration-300"
          aria-label="Contactar por WhatsApp"
        >
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}
    </div>
  );
}
