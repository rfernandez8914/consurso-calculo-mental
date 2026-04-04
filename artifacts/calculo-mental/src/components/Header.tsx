import { Calculator, Trophy } from "lucide-react";

interface HeaderProps {
  vistaActual: string;
}

export function Header({ vistaActual }: HeaderProps) {
  const nombres: Record<string, string> = {
    inicio: "Inicio",
    alumnos: "Alumnos",
    operaciones: "Operaciones",
    juego: "Juego",
    resultados: "Resultados",
  };

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-xl p-2">
            <Calculator className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl leading-tight">
              Concurso de Cálculo Mental
            </h1>
            <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-wider hidden sm:block">
              Dinámica de práctica matemática
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5">
          <Trophy className="w-4 h-4" />
          <span className="font-bold text-sm">{nombres[vistaActual]}</span>
        </div>
      </div>
    </header>
  );
}
