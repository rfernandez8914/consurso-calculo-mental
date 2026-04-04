import { Home, Users, Hash, Play, BarChart2 } from "lucide-react";
import type { Vista } from "../types";

interface NavBarProps {
  vistaActual: Vista;
  onCambiarVista: (vista: Vista) => void;
}

const LINKS = [
  { id: "inicio" as Vista, label: "Inicio", icon: Home },
  { id: "alumnos" as Vista, label: "Alumnos", icon: Users },
  { id: "operaciones" as Vista, label: "Operaciones", icon: Hash },
  { id: "juego" as Vista, label: "Juego", icon: Play },
  { id: "resultados" as Vista, label: "Resultados", icon: BarChart2 },
];

export function NavBar({ vistaActual, onCambiarVista }: NavBarProps) {
  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {LINKS.map(({ id, label, icon: Icon }) => {
            const isActive = vistaActual === id;
            return (
              <button
                key={id}
                data-testid={`nav-${id}`}
                onClick={() => onCambiarVista(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap border-b-3 transition-all ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
