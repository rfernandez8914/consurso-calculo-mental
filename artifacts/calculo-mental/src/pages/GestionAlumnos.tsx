import { useState } from "react";
import { UserPlus, Pencil, Trash2, Check, X, Users, RotateCcw } from "lucide-react";
import type { Alumno } from "../types";

interface GestionAlumnosProps {
  alumnos: Alumno[];
  onAgregar: (nombre: string) => void;
  onEditar: (id: string, nombre: string) => void;
  onEliminar: (id: string) => void;
  onResetear: () => void;
}

export function GestionAlumnos({
  alumnos,
  onAgregar,
  onEditar,
  onEliminar,
  onResetear,
}: GestionAlumnosProps) {
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState("");

  const handleAgregar = () => {
    if (!nuevoNombre.trim()) return;
    onAgregar(nuevoNombre);
    setNuevoNombre("");
  };

  const iniciarEdicion = (alumno: Alumno) => {
    setEditandoId(alumno.id);
    setNombreEdicion(alumno.nombre);
  };

  const confirmarEdicion = () => {
    if (!nombreEdicion.trim() || !editandoId) return;
    onEditar(editandoId, nombreEdicion);
    setEditandoId(null);
    setNombreEdicion("");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombreEdicion("");
  };

  const usados = alumnos.filter((a) => a.usado).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            Gestión de Alumnos
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} registrado{alumnos.length !== 1 ? "s" : ""}
            {usados > 0 && ` · ${usados} ya participó`}
          </p>
        </div>
        {usados > 0 && (
          <button
            data-testid="btn-resetear-alumnos"
            onClick={onResetear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Resetear participación
          </button>
        )}
      </div>

      {/* Formulario agregar */}
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <h3 className="font-bold text-base mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Agregar alumno
        </h3>
        <div className="flex gap-3">
          <input
            data-testid="input-nombre-alumno"
            type="text"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
            placeholder="Nombre completo del alumno..."
            className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            data-testid="btn-agregar-alumno"
            onClick={handleAgregar}
            disabled={!nuevoNombre.trim()}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Agregar
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        {alumnos.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-muted-foreground font-semibold">No hay alumnos registrados</p>
            <p className="text-muted-foreground text-sm">Agrega el primero usando el formulario de arriba.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {alumnos.map((alumno, idx) => (
              <li
                key={alumno.id}
                data-testid={`alumno-item-${alumno.id}`}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors ${alumno.usado ? "opacity-50" : ""}`}
              >
                <div className="bg-primary/10 text-primary font-display text-lg w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                {editandoId === alumno.id ? (
                  <>
                    <input
                      data-testid={`input-editar-alumno-${alumno.id}`}
                      type="text"
                      value={nombreEdicion}
                      onChange={(e) => setNombreEdicion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmarEdicion();
                        if (e.key === "Escape") cancelarEdicion();
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button onClick={confirmarEdicion} className="text-accent hover:text-accent/80 p-1.5 rounded-lg hover:bg-accent/10">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={cancelarEdicion} className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 font-semibold text-foreground">
                      {alumno.nombre}
                      {alumno.usado && <span className="ml-2 text-xs text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full">ya participó</span>}
                    </span>
                    <button
                      data-testid={`btn-editar-alumno-${alumno.id}`}
                      onClick={() => iniciarEdicion(alumno)}
                      className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`btn-eliminar-alumno-${alumno.id}`}
                      onClick={() => onEliminar(alumno.id)}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
