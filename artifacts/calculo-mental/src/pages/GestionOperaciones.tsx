import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Hash, Shuffle, Calculator } from "lucide-react";
import type { Operacion } from "../types";

interface GestionOperacionesProps {
  operaciones: Operacion[];
  onAgregar: (texto: string, respuesta: string | number) => void;
  onEditar: (id: string, texto: string, respuesta: string | number) => void;
  onEliminar: (id: string) => void;
  onMezclar: () => void;
}

function calcularRespuesta(texto: string): string | number {
  try {
    const expr = texto
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/x/gi, "*");
    const result = Function('"use strict"; return (' + expr + ")")();
    if (typeof result === "number" && isFinite(result)) {
      return Math.round(result * 100) / 100;
    }
    return "";
  } catch {
    return "";
  }
}

export function GestionOperaciones({
  operaciones,
  onAgregar,
  onEditar,
  onEliminar,
  onMezclar,
}: GestionOperacionesProps) {
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [nuevaRespuesta, setNuevaRespuesta] = useState("");
  const [autoCalc, setAutoCalc] = useState(true);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [textoEdicion, setTextoEdicion] = useState("");
  const [respuestaEdicion, setRespuestaEdicion] = useState("");

  const respuestaCalculada = autoCalc ? calcularRespuesta(nuevoTexto) : "";

  const handleAgregar = () => {
    if (!nuevoTexto.trim()) return;
    const resp = autoCalc ? (respuestaCalculada !== "" ? respuestaCalculada : nuevaRespuesta) : nuevaRespuesta;
    if (resp === "" && !autoCalc) return;
    const respFinal = resp !== "" ? resp : respuestaCalculada;
    onAgregar(nuevoTexto, respFinal !== "" ? respFinal : nuevaRespuesta);
    setNuevoTexto("");
    setNuevaRespuesta("");
  };

  const iniciarEdicion = (op: Operacion) => {
    setEditandoId(op.id);
    setTextoEdicion(op.texto);
    setRespuestaEdicion(String(op.respuesta));
  };

  const confirmarEdicion = () => {
    if (!textoEdicion.trim() || !editandoId) return;
    const respNum = parseFloat(respuestaEdicion);
    const resp = isNaN(respNum) ? respuestaEdicion : respNum;
    onEditar(editandoId, textoEdicion, resp);
    setEditandoId(null);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
            <Hash className="w-7 h-7 text-primary" />
            Gestión de Operaciones
          </h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            {operaciones.length} operación{operaciones.length !== 1 ? "es" : ""} capturada{operaciones.length !== 1 ? "s" : ""}
          </p>
        </div>
        {operaciones.length > 1 && (
          <button
            data-testid="btn-mezclar"
            onClick={onMezclar}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold transition-all"
          >
            <Shuffle className="w-4 h-4" />
            Mezclar orden
          </button>
        )}
      </div>

      {/* Formulario agregar */}
      <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" />
          Agregar operación
        </h3>

        <div className="flex gap-3 flex-wrap">
          <input
            data-testid="input-texto-operacion"
            type="text"
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
            placeholder="Ej: 8 + 7, 6 × 4, 18 ÷ 3..."
            className="flex-1 min-w-48 px-4 py-3 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {!autoCalc && (
            <input
              data-testid="input-respuesta-operacion"
              type="text"
              value={nuevaRespuesta}
              onChange={(e) => setNuevaRespuesta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAgregar()}
              placeholder="Respuesta correcta"
              className="w-44 px-4 py-3 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          <button
            data-testid="btn-agregar-operacion"
            onClick={handleAgregar}
            disabled={!nuevoTexto.trim()}
            className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              data-testid="toggle-auto-calc"
              onClick={() => setAutoCalc(!autoCalc)}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${autoCalc ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoCalc ? "translate-x-5" : "translate-x-0.5"}`} />
            </div>
            <span className="font-medium flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              Calcular respuesta automáticamente
            </span>
          </label>
          {autoCalc && nuevoTexto && (
            <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-lg font-mono">
              = {respuestaCalculada !== "" ? respuestaCalculada : "?"}
            </span>
          )}
        </div>

        <p className="text-muted-foreground text-xs">
          Usa <strong>+</strong>, <strong>-</strong>, <strong>×</strong> o <strong>÷</strong> (también puedes usar * y /).
          Con el cálculo automático activado, la respuesta se calcula al instante.
        </p>
      </div>

      {/* Lista */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        {operaciones.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-5xl mb-3">🔢</div>
            <p className="text-muted-foreground font-semibold">No hay operaciones capturadas</p>
            <p className="text-muted-foreground text-sm">Agrega la primera usando el formulario de arriba.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {operaciones.map((op, idx) => (
              <li
                key={op.id}
                data-testid={`operacion-item-${op.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="bg-secondary/20 text-secondary-foreground font-display text-lg w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                {editandoId === op.id ? (
                  <>
                    <input
                      type="text"
                      value={textoEdicion}
                      onChange={(e) => setTextoEdicion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmarEdicion();
                        if (e.key === "Escape") cancelarEdicion();
                      }}
                      autoFocus
                      className="flex-1 px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                    <span className="text-muted-foreground">=</span>
                    <input
                      type="text"
                      value={respuestaEdicion}
                      onChange={(e) => setRespuestaEdicion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmarEdicion();
                        if (e.key === "Escape") cancelarEdicion();
                      }}
                      className="w-24 px-3 py-1.5 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono text-center"
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
                    <span className="flex-1 font-mono font-bold text-foreground text-lg">
                      {op.texto}
                    </span>
                    <span className="text-muted-foreground text-sm">= <strong className="text-foreground font-mono">{op.respuesta}</strong></span>
                    <button
                      data-testid={`btn-editar-operacion-${op.id}`}
                      onClick={() => iniciarEdicion(op)}
                      className="text-muted-foreground hover:text-primary p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      data-testid={`btn-eliminar-operacion-${op.id}`}
                      onClick={() => onEliminar(op.id)}
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
