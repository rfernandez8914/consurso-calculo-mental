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
import { useAppData } from "@/hooks/useAppData";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Vista, ResultadoRonda } from "@/types";

const queryClient = new QueryClient();

function AppContent() {
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header vistaActual={vista} />
      <NavBar vistaActual={vista} onCambiarVista={setVista} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {vista === "inicio" && (
          <Inicio
            totalAlumnos={alumnos.length}
            totalOperaciones={operaciones.length}
            onCambiarVista={setVista}
            onImportar={importarDatos}
            onExportar={exportarDatos}
          />
        )}
        {vista === "alumnos" && (
          <GestionAlumnos
            alumnos={alumnos}
            onAgregar={agregarAlumno}
            onEditar={editarAlumno}
            onEliminar={eliminarAlumno}
            onResetear={resetearAlumnos}
          />
        )}
        {vista === "operaciones" && (
          <GestionOperaciones
            operaciones={operaciones}
            onAgregar={agregarOperacion}
            onEditar={editarOperacion}
            onEliminar={eliminarOperacion}
            onMezclar={mezclarOperaciones}
          />
        )}
        {vista === "juego" && (
          <Juego
            alumnos={alumnos}
            operaciones={operaciones}
            onMarcarUsado={marcarAlumnoUsado}
            onGuardarResultado={handleGuardarResultado}
            onCambiarVista={(v) => setVista(v)}
          />
        )}
        {vista === "resultados" && (
          <Resultados
            resultados={resultados}
            onNuevaRonda={handleNuevaRonda}
          />
        )}
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
        <AppContent />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
