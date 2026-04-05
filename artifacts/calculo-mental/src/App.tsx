import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router as WouterRouter } from "wouter";
import { Header } from "@/components/Header";
import { NavBar } from "@/components/NavBar";
import { Inicio } from "@/pages/Inicio";
import { GestionAlumnos } from "@/pages/GestionAlumnos";
import { GestionOperaciones } from "@/pages/GestionOperaciones";
import { Juego } from "@/pages/Juego";
import { Resultados } from "@/pages/Resultados";
import { Login } from "@/pages/Login";
import { Perfil } from "@/pages/Perfil";
import { AdminUsuarios } from "@/pages/AdminUsuarios";
import { useAlumnos } from "@/hooks/useAlumnos";
import { useOperaciones } from "@/hooks/useOperaciones";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import type { Vista, ResultadoRonda } from "@/types";

const queryClient = new QueryClient();

function AuthenticatedApp({ userId, role }: { userId: number; role: string }) {
  const [vista, setVista] = useState<Vista>("inicio");
  const [resultados, setResultados] = useLocalStorage<ResultadoRonda[]>(
    `u${userId}-calculo-resultados`,
    [],
  );

  const {
    alumnos,
    agregarAlumno,
    editarAlumno,
    eliminarAlumno,
    marcarAlumnoUsado,
    resetearAlumnos,
    importarAlumnos,
  } = useAlumnos();

  const {
    operaciones,
    agregarOperacion,
    editarOperacion,
    eliminarOperacion,
    mezclarOperaciones,
    importarOperaciones,
  } = useOperaciones();

  const handleGuardarResultado = (resultado: ResultadoRonda) => {
    setResultados((prev) => [...prev, resultado]);
  };

  const handleNuevaRonda = () => {
    setVista("juego");
  };

  const exportarDatos = () => {
    const datos = {
      alumnos: alumnos.map((a) => ({ nombre: a.nombre })),
      operaciones: operaciones.map((op) => ({ texto: op.texto, respuesta: op.respuesta })),
    };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "concurso-calculo-mental.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarDatos = async (json: string): Promise<boolean> => {
    try {
      const datos = JSON.parse(json) as {
        alumnos?: { nombre: string }[];
        operaciones?: { texto: string; respuesta: string | number }[];
      };
      if (datos.alumnos) await importarAlumnos(datos.alumnos);
      if (datos.operaciones) await importarOperaciones(datos.operaciones);
      return true;
    } catch {
      return false;
    }
  };

  const vistaFinal: Vista =
    vista === "admin-usuarios" && role !== "admin" ? "inicio" : vista;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header vistaActual={vistaFinal} />
      <NavBar vistaActual={vistaFinal} onCambiarVista={setVista} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {vistaFinal === "inicio" && (
          <Inicio
            totalAlumnos={alumnos.length}
            totalOperaciones={operaciones.length}
            onCambiarVista={setVista}
            onImportar={importarDatos}
            onExportar={exportarDatos}
          />
        )}
        {vistaFinal === "alumnos" && (
          <GestionAlumnos
            alumnos={alumnos}
            onAgregar={agregarAlumno}
            onEditar={editarAlumno}
            onEliminar={eliminarAlumno}
            onResetear={resetearAlumnos}
          />
        )}
        {vistaFinal === "operaciones" && (
          <GestionOperaciones
            operaciones={operaciones}
            onAgregar={agregarOperacion}
            onEditar={editarOperacion}
            onEliminar={eliminarOperacion}
            onMezclar={mezclarOperaciones}
          />
        )}
        {vistaFinal === "juego" && (
          <Juego
            alumnos={alumnos}
            operaciones={operaciones}
            onMarcarUsado={marcarAlumnoUsado}
            onGuardarResultado={handleGuardarResultado}
            onCambiarVista={(v) => setVista(v)}
          />
        )}
        {vistaFinal === "resultados" && (
          <Resultados
            resultados={resultados}
            onNuevaRonda={handleNuevaRonda}
          />
        )}
        {vistaFinal === "perfil" && <Perfil />}
        {vistaFinal === "admin-usuarios" && role === "admin" && <AdminUsuarios />}
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        Concurso de Cálculo Mental · Los datos se guardan en tu cuenta
      </footer>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="inline-block w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <AuthenticatedApp userId={user.id} role={user.role} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
