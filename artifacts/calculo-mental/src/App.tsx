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
import { useAppData } from "@/hooks/useAppData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import type { Vista, ResultadoRonda } from "@/types";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const [vista, setVista] = useState<Vista>("inicio");
  const [resultados, setResultados] = useLocalStorage<ResultadoRonda[]>("calculo-resultados", []);

  const {
    alumnos,
    operaciones,
    agregarAlumno,
    editarAlumno,
    eliminarAlumno,
    marcarAlumnoUsado,
    resetearAlumnos,
    agregarOperacion,
    editarOperacion,
    eliminarOperacion,
    mezclarOperaciones,
    exportarDatos,
    importarDatos,
  } = useAppData();

  const handleGuardarResultado = (resultado: ResultadoRonda) => {
    setResultados((prev) => [...prev, resultado]);
  };

  const handleNuevaRonda = () => {
    setVista("juego");
  };

  // Pantalla de carga mientras se verifica la sesión
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

  // Si no hay sesión → Login
  if (!user) {
    return <Login />;
  }

  // Solo admin puede ver la pantalla de administración
  const vistaFinal: Vista =
    vista === "admin-usuarios" && user.role !== "admin" ? "inicio" : vista;

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
        {vistaFinal === "admin-usuarios" && user.role === "admin" && <AdminUsuarios />}
      </main>
      <footer className="border-t border-border py-3 text-center text-xs text-muted-foreground">
        Concurso de Cálculo Mental · Los datos se guardan automáticamente en tu navegador
      </footer>
    </div>
  );
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
