import { Calculator, Trophy, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  vistaActual: string;
}

const NOMBRES: Record<string, string> = {
  inicio: "Inicio",
  alumnos: "Alumnos",
  operaciones: "Operaciones",
  juego: "Juego",
  resultados: "Resultados",
  perfil: "Mi Perfil",
  "admin-usuarios": "Usuarios",
};

export function Header({ vistaActual }: HeaderProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

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
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden md:flex items-center gap-1.5 bg-white/10 rounded-xl px-3 py-1.5">
              {isAdmin
                ? <ShieldCheck className="w-4 h-4 opacity-80" />
                : <UserRound className="w-4 h-4 opacity-80" />
              }
              <span className="text-xs font-semibold opacity-90 max-w-[140px] truncate">
                {isAdmin ? "Admin" : "Maestro"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5">
            <Trophy className="w-4 h-4" />
            <span className="font-bold text-sm">{NOMBRES[vistaActual] ?? vistaActual}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
