import "@/app/globals.css";

export const metadata = {
  title: "Evaluación - Cursia Enterprise",
  description: "Evaluación gratuita de conocimientos",
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Clean minimal header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-xl font-bold">
            <span className="text-black">Curs</span>
            <span className="text-indigo-600">ia</span>
            <span className="text-black"> Enterprise</span>
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white/50 mt-12">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Cursia Enterprise. Plataforma de capacitación corporativa.</p>
        </div>
      </footer>
    </div>
  );
}
