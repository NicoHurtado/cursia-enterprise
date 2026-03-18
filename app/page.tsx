"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  CheckCircle2,
  ArrowRight,
  LogIn,
  Instagram,
  Phone,
  MessageSquare,
  Sparkles,
  BookOpen,
  PieChart,
  Calendar,
  Building2,
  Briefcase,
  User,
  Mail,
  Smartphone,
  Send
} from "lucide-react";

export default function Home() {
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    correo: "",
    empresa: "",
    cargo: "",
    numEmpleados: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  // Botón WhatsApp con lazy render: se muestra ~1s después para no competir con LCP
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShowWhatsAppButton(true), 1000);
    return () => clearTimeout(t);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitLead = async () => {
    if (!isFormValid || formSubmitting) return;
    setFormSubmitting(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setFormSubmitted(true);
    } catch (error) {
      console.error('Error al guardar lead:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const isFormValid = formData.nombre && formData.celular && formData.correo && formData.empresa && formData.cargo && formData.numEmpleados;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">
                <span className="text-slate-900">Curs</span>
                <span className="text-[#0066FF]">ia</span>
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <a href="#admin" className="hover:text-[#0066FF] transition-colors">Administración</a>
              <a href="#ai" className="hover:text-[#0066FF] transition-colors">Tecnología IA</a>
              <a href="#contacto" className="hover:text-[#0066FF] transition-colors">Contacto</a>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <a
                href="https://instagram.com/cursia.online"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex p-2 text-slate-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <Link
                href="/auth/signin"
                className="flex items-center px-3 py-2 sm:px-4 text-slate-600 hover:text-slate-900 transition-all font-bold text-sm gap-1.5 sm:gap-2"
              >
                <LogIn className="w-4 h-4" /> <span className="hidden sm:inline">Acceder</span>
              </Link>
              <a
                href="#contacto"
                className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white transition-all font-bold text-xs sm:text-sm gap-1.5 sm:gap-2 shadow-sm"
              >
                Demo <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section with Two Clear CTAs */}
        <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-50 blur-[120px] rounded-full opacity-60 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase mb-6">
              <ShieldCheck className="w-4 h-4" /> Integridad Garantizada
            </div>

            <h1 className="text-5xl lg:text-[5rem] font-extrabold tracking-tight mb-8 text-slate-900 leading-[1.05]">
              Cultura de Aprendizaje <br />
              Guiada por <span className="text-[#0066FF]">Inteligencia Artificial</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl lg:text-2xl text-slate-500 mb-16 leading-relaxed font-normal">
              Asegure el dominio real de habilidades con nuestra plataforma B2B. Consultoría estratégica, acompañamiento constante de IA y resultados verificables.
            </p>

            {/* Two Clear CTA Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card 1: Ya te dieron acceso */}
              <div className="group p-8 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-emerald-800 mb-3">¿Ya te dieron acceso?</h3>
                <p className="text-emerald-700/80 mb-6 leading-relaxed">
                  Ingresa con tu correo corporativo para acceder a tus cursos asignados y continuar tu formación.
                </p>
                <Link
                  href="/auth/signin"
                  className="w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all gap-3 shadow-lg shadow-emerald-500/20"
                >
                  Ir a la Plataforma <ArrowRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Card 2: Aún no se ha cuadrado nada */}
              <div className="group p-8 rounded-[2rem] bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                <div className="w-16 h-16 rounded-2xl bg-[#0066FF] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-3">¿Aún no se ha cuadrado nada?</h3>
                <p className="text-blue-700/80 mb-6 leading-relaxed">
                  Agenda una reunión estratégica con nosotros para conocer cómo podemos transformar la capacitación de tu empresa.
                </p>
                <a
                  href="#contacto"
                  className="w-full inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-[#0066FF] text-white font-bold text-lg hover:bg-blue-700 transition-all gap-3 shadow-lg shadow-blue-500/20"
                >
                  Agendar Reunión <Calendar className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto text-[#0066FF]">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Enfoque Consultivo</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Cada implementación inicia con una sesión estratégica para alinear nuestro software a su cultura organizacional.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto text-[#0066FF]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Acompañante de IA</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Los estudiantes cuentan con asistencia constante que resuelve dudas y guía el razonamiento en tiempo real.</p>
              </div>
              <div className="text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto text-[#0066FF]">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold">Aprendizaje Real</h3>
                <p className="text-slate-500 text-sm leading-relaxed">Cambiamos opciones múltiples por preguntas abiertas, evaluando la profundidad del conocimiento de sus empleados.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Admin Section */}
        <section id="admin" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
                <div className="p-1 rounded-[2.5rem] bg-slate-200 shadow-inner">
                  <div className="p-8 md:p-12 rounded-[2.25rem] bg-white shadow-2xl">
                    <div className="flex items-center justify-between mb-10">
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Panel de Control</h4>
                        <p className="text-xl font-bold text-slate-800">Administrador de Empresa</p>
                      </div>
                      <LayoutDashboard className="w-8 h-8 text-[#0066FF]" />
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#0066FF]">
                          <Users className="w-5 h-5" />
                        </div>
                        <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-[#0066FF]" />
                        </div>
                        <span className="font-bold text-sm">75%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-slate-100 bg-white">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Inscritos</p>
                          <p className="text-2xl font-black">1.2k</p>
                        </div>
                        <div className="p-4 rounded-2xl border border-slate-100 bg-white">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Promedio</p>
                          <p className="text-2xl font-black text-emerald-500">8.9</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-8 text-slate-900 leading-tight">Gestión Corporativa <br /><span className="text-[#0066FF]">Sin Fricción</span></h2>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                  Otorgamos a los directores de RRHH y gerentes de área las herramientas necesarias para monitorear el progreso de sus equipos en tiempo real.
                </p>
                <div className="space-y-6 text-slate-600 font-medium">
                  <div className="flex items-start gap-4 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
                    <PieChart className="w-6 h-6 text-[#0066FF] mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Métricas de Progreso</h4>
                      <p className="text-sm">Vea el avance exacto de cada empleado y el tiempo dedicado a su capacitación.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
                    <ShieldCheck className="w-6 h-6 text-emerald-500 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Gestión de Contratos</h4>
                      <p className="text-sm">Control centralizado de licencias, fechas de vigencia y documentación corporativa.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-6 rounded-3xl hover:bg-slate-50 transition-colors">
                    <BookOpen className="w-6 h-6 text-purple-500 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 mb-1">Reportes Ejecutivos</h4>
                      <p className="text-sm">Genere informes listos para presentar, analizando el impacto de formación por sedes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Tech Section */}
        <section id="ai" className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900">IA para una Formación <span className="text-[#0066FF]">Honesta</span></h2>
              <p className="text-lg text-slate-500 leading-relaxed font-light">
                Utilizamos Inteligencia Artificial no solo para enseñar, sino para asegurar que el aprendizaje sea auténtico, especialmente en entornos de preguntas abiertas.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="group p-10 rounded-[3rem] bg-white border border-slate-200 hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-[#0066FF] mb-8 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Detección de Fraude</h3>
                <p className="text-slate-500 leading-relaxed">
                  Con el auge de las herramientas generativas, nuestro sistema identifica si las respuestas abiertas de los empleados son propias o copiadas de modelos externos, garantizando la integridad del proceso.
                </p>
              </div>
              <div className="group p-10 rounded-[3rem] bg-white border border-slate-200 hover:shadow-2xl transition-all duration-500">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Evaluación Cognitiva</h3>
                <p className="text-slate-500 leading-relaxed">
                  La IA califica el razonamiento lógico en respuestas abiertas, comparando la intención del estudiante con los criterios técnicos del curso, brindando retroalimentación personalizada de valor.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contacto" className="py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/50 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                Iniciemos el Cambio <br />en su <span className="text-[#0066FF]">Organización</span>
              </h2>
              <p className="text-xl text-slate-500 leading-relaxed">
                Complete sus datos y nos pondremos en contacto para diseñar el plan de capacitación ideal para su equipo.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-white shadow-[0_30px_60px_-15px_rgba(0,102,255,0.1)] border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0066FF] flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900">Solicitar Demo</h3>
                    <p className="text-sm text-slate-500">Complete el formulario y lo contactaremos</p>
                  </div>
                </div>

                <form className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <User className="w-3 h-3" /> Nombre y Apellidos
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Ej: Juan Pérez García"
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> Celular
                      </label>
                      <input
                        type="tel"
                        name="celular"
                        value={formData.celular}
                        onChange={handleInputChange}
                        placeholder="Ej: 300 123 4567"
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Correo
                    </label>
                    <input
                      type="email"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      placeholder="nombre@empresa.com"
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Nombre Empresa
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        placeholder="Ej: Mi Empresa S.A.S"
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> Cargo
                      </label>
                      <select
                        name="cargo"
                        value={formData.cargo}
                        onChange={handleInputChange}
                        className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900"
                      >
                        <option value="">Seleccione su cargo</option>
                        <option value="Gerente de RRHH">Gerente de RRHH</option>
                        <option value="Director de Talento Humano">Director de Talento Humano</option>
                        <option value="Gerente General">Gerente General</option>
                        <option value="Director de Operaciones">Director de Operaciones</option>
                        <option value="Coordinador de Capacitación">Coordinador de Capacitación</option>
                        <option value="Jefe de Área">Jefe de Área</option>
                        <option value="CEO/Fundador">CEO/Fundador</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Número de Empleados
                    </label>
                    <select
                      name="numEmpleados"
                      value={formData.numEmpleados}
                      onChange={handleInputChange}
                      className="w-full px-5 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900"
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="1-10">1 - 10 empleados</option>
                      <option value="11-50">11 - 50 empleados</option>
                      <option value="51-200">51 - 200 empleados</option>
                      <option value="201-500">201 - 500 empleados</option>
                      <option value="500+">Más de 500 empleados</option>
                    </select>
                  </div>

                  {formSubmitted ? (
                    <div className="w-full py-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center mt-6 animate-in fade-in duration-300">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                      <p className="text-lg font-bold text-emerald-800">¡Datos enviados correctamente!</p>
                      <p className="text-sm text-emerald-600 mt-1">Nos pondremos en contacto contigo pronto.</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmitLead}
                      disabled={!isFormValid || formSubmitting}
                      className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 mt-6 ${isFormValid && !formSubmitting
                        ? "bg-[#0066FF] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                    >
                      <Send className="w-5 h-5" />
                      {formSubmitting ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                  )}
                </form>
              </div>

              {/* Contact Info Cards */}
              <div className="space-y-6">
                {/* WhatsApp CTA Button */}
                <a
                  href="https://wa.me/573246590060"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-800 mb-1">Comunícate al instante con nosotros por WhatsApp</p>
                    <p className="text-sm text-green-600 font-medium">Respuesta inmediata</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                </a>

                {/* Phone Cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <a
                    href="tel:+573185529534"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Llámanos</p>
                      <p className="text-lg font-bold text-slate-800">318 552 9534</p>
                    </div>
                  </a>
                  <a
                    href="tel:+573005529221"
                    className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-[#0066FF] group-hover:bg-[#0066FF] group-hover:text-white transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Llámanos</p>
                      <p className="text-lg font-bold text-slate-800">300 552 9221</p>
                    </div>
                  </a>
                </div>

                {/* Instagram Card */}
                <a
                  href="https://instagram.com/cursia.online"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-5 p-6 rounded-[2rem] bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 shadow-sm hover:shadow-lg hover:translate-x-2 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <Instagram className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Síguenos en Instagram</p>
                    <p className="text-xl font-bold text-slate-800">@cursia.online</p>
                    <p className="text-sm text-pink-600 font-medium">Contenido exclusivo</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                </a>

                {/* Info Box */}
                <div className="p-6 rounded-2xl bg-blue-50/80 border border-blue-100">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-[#0066FF]">💡 Tip:</span> Al enviar el formulario, nuestro equipo se comunicará contigo en menos de 24 horas para coordinar una reunión estratégica.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* WhatsApp Floating Button - Lazy render: aparece después de la carga para no afectar LCP */}
      {showWhatsAppButton && (
        <a
          href="https://wa.me/573246590060"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] hover:bg-[#20BA5A] shadow-2xl hover:shadow-[#25D366]/50 transition-all hover:scale-110 animate-in fade-in duration-300"
          aria-label="Contactar por WhatsApp"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
      )}

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">Cursia</span>
          </div>
          <div className="flex gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <a href="https://instagram.com/cursia.online" className="hover:text-pink-500 transition-colors">Instagram</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Términos</a>
          </div>
          <p className="text-slate-400 text-xs font-medium">© 2026 Cursia for Enterprise.</p>
        </div>
      </footer>

    </div>
  );
}
