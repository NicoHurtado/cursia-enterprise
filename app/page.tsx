import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  ShieldCheck,
  BrainCircuit,
  LayoutDashboard,
  Zap,
  Users,
  BarChart3,
  CheckCircle2,
  Lock,
  ArrowRight,
  LogIn,
  Instagram,
  Mail,
  Phone,
  MessageSquare,
  Sparkles,
  BookOpen,
  PieChart
} from "lucide-react";

export default async function Home() {
  const session = await auth();

  const dashboardLink = session ? (
    session.user.role === "ADMIN" ? "/admin" :
      (session.user.role === "CLIENT" || session.user.role === "CONTRACT_ADMIN") ? "/employee/admin" :
        "/employee"
  ) : "/auth/signin";

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

            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com/cursia.online"
                target="_blank"
                rel="noreferrer"
                className="p-2 text-slate-400 hover:text-pink-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <Link
                href={dashboardLink}
                className="hidden sm:flex items-center px-4 py-2 text-slate-600 hover:text-slate-900 transition-all font-bold text-sm gap-2"
              >
                <LogIn className="w-4 h-4" /> {session ? "Mi Panel" : "Acceder"}
              </Link>
              <a
                href="#contacto"
                className="inline-flex items-center px-6 py-2.5 rounded-full bg-[#0066FF] hover:bg-blue-700 text-white transition-all font-bold text-sm gap-2 shadow-sm"
              >
                Agendar Demo <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden bg-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-blue-50 blur-[120px] rounded-full opacity-60 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase mb-6">
              <ShieldCheck className="w-4 h-4" /> Integridad Garantizada
            </div>

            <h1 className="text-6xl lg:text-[5.5rem] font-extrabold tracking-tight mb-8 text-slate-900 leading-[1.05]">
              Cultura de Aprendizaje <br />
              Guiada por <span className="text-[#0066FF]">Inteligencia Artificial</span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl lg:text-2xl text-slate-500 mb-12 leading-relaxed font-normal">
              Asegure el dominio real de habilidades con nuestra plataforma B2B. Consultoría estratégica, acompañamiento constante de IA y resultados verificables.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a
                href="#contacto"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#0066FF] text-white font-bold text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20"
              >
                Agendar Reunión Inicial <ArrowRight className="w-6 h-6" />
              </a>
              <Link
                href={dashboardLink}
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-100 text-slate-700 font-bold text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
              >
                {session ? "Ir a mi Panel" : "Acceso a la Plataforma"}
              </Link>
            </div>

            <div className="mt-12 max-w-2xl mx-auto p-6 rounded-3xl bg-blue-50/50 border border-blue-100/50 text-slate-600 text-sm leading-relaxed">
              <p>
                <span className="font-bold text-[#0066FF]">Información Importante:</span> El contenido se habilita únicamente tras la sesión estratégica inicial con su organización. Si su empresa ya cuenta con un contrato activo, <strong>regístrese con su correo corporativo</strong> para visualizar automáticamente sus cursos asignados.
              </p>
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
        <section id="contacto" className="py-40 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-50/50 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl font-black text-slate-900 mb-8 leading-tight">Iniciemos el Cambio <br /> en su Organización</h2>
                <p className="text-xl text-slate-500 mb-12 font-light leading-relaxed">
                  Para habilitar el acceso a su equipo, primero realizamos una consultoría técnica. Cuéntenos sobre su empresa y nos pondremos en contacto vía Instagram o WhatsApp para agendar una sesión.
                </p>
                <div className="space-y-6">
                  <a
                    href="https://instagram.com/cursia.online"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:translate-x-2 transition-transform group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-500">
                      <Instagram className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">Contactar vía Instagram</p>
                      <p className="font-bold text-slate-800">@cursia.online</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="p-10 md:p-12 rounded-[3.5rem] bg-white shadow-[0_30px_60px_-15px_rgba(0,102,255,0.1)] border border-slate-100">
                <form className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                    <input type="text" placeholder="Ej: Juan Pérez" className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Correo Corporativo</label>
                    <input type="email" placeholder="nombre@empresa.com" className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mensaje o Empresa</label>
                    <textarea placeholder="Cuéntenos sus retos de capacitación..." rows={3} className="w-full px-6 py-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 transition-all font-medium text-slate-900 resize-none" />
                  </div>
                  <button type="button" className="w-full py-5 rounded-3xl bg-[#0066FF] text-white font-bold text-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]">
                    Solicitar Consultoría Demo
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

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
