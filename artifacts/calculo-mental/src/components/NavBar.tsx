import { Home, Users, Hash, Play, BarChart2, UserRound, ShieldCheck, LogOut } from "lucide-react";
import type { Vista } from "../types";
import { useAuth } from "@/hooks/useAuth";

interface NavBarProps {
  vistaActual: Vista;
  onCambiarVista: (vista: Vista) => void;
}

const LINKS_BASE = [
  { id: "inicio" as Vista, label: "Inicio", icon: Home },
  { id: "alumnos" as Vista, label: "Alumnos", icon: Users },
  { id: "operaciones" as Vista, label: "Operaciones", icon: Hash },
  { id: "juego" as Vista, label: "Juego", icon: Play },
  { id: "resultados" as Vista, label: "Resultados", icon: BarChart2 },
];

export function NavBar({ vistaActual, onCambiarVista }: NavBarProps) {
  const { user, logout } = useAuth();

  const links = [
    ...LINKS_BASE,
    ...(user?.role === "admin"
      ? [{ id: "admin-usuarios" as Vista, label: "Usuarios", icon: ShieldCheck }]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Links de navegación */}
          <div className="flex gap-1 overflow-x-auto">
            {links.map(({ id, label, icon: Icon }) => {
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

          {/* Usuario y acciones */}
          <div className="flex items-center gap-1 flex-shrink-0 pl-2">
            <button
              onClick={() => onCambiarVista("perfil")}
              className={`flex items-center gap-2 px-3 py-3 text-sm font-semibold whitespace-nowrap border-b-3 transition-all ${
                vistaActual === "perfil"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
              }`}
              title={user?.email}
            >
              <UserRound className="w-4 h-4" />
              <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
