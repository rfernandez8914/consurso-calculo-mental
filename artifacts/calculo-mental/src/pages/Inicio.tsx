import { Users, Hash, Play, Star, BookOpen, Lightbulb, Download, Upload } from "lucide-react";
import type { Vista } from "../types";
import { useRef } from "react";

interface InicioProps {
  totalAlumnos: number;
  totalOperaciones: number;
  onCambiarVista: (vista: Vista) => void;
  onImportar: (json: string) => Promise<boolean>;
  onExportar: () => void;
}

export function Inicio({ totalAlumnos, totalOperaciones, onCambiarVista, onImportar, onExportar }: InicioProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const json = ev.target?.result as string;
      const ok = await onImportar(json);
      if (!ok) alert("Error al importar el archivo. Verifica que sea un JSON válido.");
      else alert("Datos importados correctamente.");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center py-10 px-4">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-3xl mb-4 animate-float">
          <span className="text-5xl">🏆</span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl text-primary mb-3">
          ¡Bienvenido al Concurso!
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Una dinámica divertida de cálculo mental para usar en el salón de clases.
          Selecciona alumnos al azar y pon a prueba sus habilidades matemáticas.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <button
          data-testid="card-alumnos"
          onClick={() => onCambiarVista("alumnos")}
          className="bg-card border border-card-border rounded-2xl p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 rounded-xl p-2.5">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-muted-foreground text-sm uppercase tracking-wide">Alumnos</span>
          </div>
          <div className="font-display text-5xl text-primary">{totalAlumnos}</div>
          <div className="text-muted-foreground text-sm mt-1">
            {totalAlumnos === 0 ? "Agrega alumnos para comenzar" : "registrados"}
          </div>
        </button>

        <button
          data-testid="card-operaciones"
          onClick={() => onCambiarVista("operaciones")}
          className="bg-card border border-card-border rounded-2xl p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-secondary/20 rounded-xl p-2.5">
              <Hash className="w-6 h-6 text-secondary-foreground" />
            </div>
            <span className="font-bold text-muted-foreground text-sm uppercase tracking-wide">Operaciones</span>
          </div>
          <div className="font-display text-5xl text-foreground">{totalOperaciones}</div>
          <div className="text-muted-foreground text-sm mt-1">
            {totalOperaciones === 0 ? "Agrega operaciones para comenzar" : "capturadas"}
          </div>
        </button>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          data-testid="btn-ir-juego"
          onClick={() => onCambiarVista("juego")}
          disabled={totalAlumnos === 0 || totalOperaciones === 0}
          className="bg-primary text-primary-foreground font-bold text-xl px-10 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 mx-auto"
        >
          <Play className="w-6 h-6" />
          ¡Iniciar Concurso!
        </button>
        {(totalAlumnos === 0 || totalOperaciones === 0) && (
          <p className="text-muted-foreground text-sm mt-2">
            Necesitas al menos un alumno y una operación para jugar.
          </p>
        )}
      </div>

      {/* Instrucciones */}
      <div className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-2xl text-foreground flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          ¿Cómo se usa?
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { num: "1", title: "Agrega alumnos", desc: "Ve a la sección Alumnos y registra a tu grupo. Los datos se guardan automáticamente." },
            { num: "2", title: "Carga operaciones", desc: "Ve a Operaciones y agrega las sumas, restas, multiplicaciones o divisiones que deseas practicar." },
            { num: "3", title: "¡A jugar!", desc: "En la pantalla de Juego, elige un alumno al azar y muestra las operaciones una por una o todas juntas." },
            { num: "4", title: "Ver resultados", desc: "Al terminar una ronda interactiva, revisa cuántos aciertos tuvo cada alumno en la pantalla de Resultados." },
          ].map((paso) => (
            <div key={paso.num} className="flex gap-3 items-start">
              <div className="bg-primary text-primary-foreground font-display text-xl w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                {paso.num}
              </div>
              <div>
                <div className="font-bold text-foreground">{paso.title}</div>
                <div className="text-muted-foreground text-sm">{paso.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-secondary/10 border border-secondary/30 rounded-2xl p-5 flex gap-3">
        <Lightbulb className="w-6 h-6 text-secondary-foreground flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-foreground mb-1">Consejo para el docente</div>
          <div className="text-muted-foreground text-sm">
            En el modo <strong>Simple</strong>, solo se muestran las operaciones para que el alumno responda oralmente.
            En modo <strong>Interactivo</strong>, el alumno escribe sus respuestas y el sistema las califica automáticamente.
          </div>
        </div>
      </div>

      {/* Export / Import */}
      <div className="flex flex-wrap gap-3 justify-center border-t border-border pt-6">
        <button
          data-testid="btn-exportar"
          onClick={onExportar}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:shadow text-sm font-semibold transition-all"
        >
          <Download className="w-4 h-4" />
          Exportar datos (JSON)
        </button>
        <button
          data-testid="btn-importar"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card hover:shadow text-sm font-semibold transition-all"
        >
          <Upload className="w-4 h-4" />
          Importar datos (JSON)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="flex items-center gap-2 text-muted-foreground/60 text-xs">
          <Star className="w-3 h-3" />
          Los datos se guardan automáticamente en este navegador
        </div>
      </div>
    </div>
  );
}
