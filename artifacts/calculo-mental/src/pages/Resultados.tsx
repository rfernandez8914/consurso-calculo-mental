import { CheckCircle2, XCircle, Trophy, RotateCcw, Clock } from "lucide-react";
import type { ResultadoRonda } from "../types";

interface ResultadosProps {
  resultados: ResultadoRonda[];
  onNuevaRonda: () => void;
}

function formatFecha(ts: number) {
  return new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export function Resultados({ resultados, onNuevaRonda }: ResultadosProps) {
  if (resultados.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
          <Trophy className="w-7 h-7 text-primary" />
          Resultados
        </h2>
        <div className="bg-card border border-card-border rounded-2xl py-16 text-center">
          <div className="text-5xl mb-3">📊</div>
          <p className="text-muted-foreground font-semibold">No hay resultados todavía</p>
          <p className="text-muted-foreground text-sm">
            Completa una ronda en modo <strong>Interactivo</strong> para ver los resultados aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
          <Trophy className="w-7 h-7 text-primary" />
          Resultados
        </h2>
        <button
          data-testid="btn-nueva-ronda-resultados"
          onClick={onNuevaRonda}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:shadow-md text-sm font-bold transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Nueva ronda
        </button>
      </div>

      {[...resultados].reverse().map((resultado, idx) => {
        const pct = resultado.total > 0 ? Math.round((resultado.totalAciertos / resultado.total) * 100) : 0;
        const esUltimo = idx === 0;
        return (
          <div
            key={resultado.timestamp}
            data-testid={`resultado-card-${resultado.timestamp}`}
            className={`bg-card border rounded-2xl overflow-hidden shadow transition-all ${esUltimo ? "border-primary shadow-md" : "border-card-border"}`}
          >
            {/* Header */}
            <div className={`px-6 py-4 flex items-center justify-between flex-wrap gap-3 ${esUltimo ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-2xl ${esUltimo ? "bg-white/20" : "bg-primary/10 text-primary"}`}>
                  {pct >= 80 ? "🏆" : pct >= 50 ? "⭐" : "📝"}
                </div>
                <div>
                  <div className={`font-display text-2xl ${esUltimo ? "text-white" : "text-foreground"}`}>
                    {resultado.alumno.nombre}
                  </div>
                  <div className={`text-sm flex items-center gap-1 ${esUltimo ? "text-white/70" : "text-muted-foreground"}`}>
                    <Clock className="w-3.5 h-3.5" />
                    {formatFecha(resultado.timestamp)}
                    {esUltimo && <span className="ml-1 font-bold bg-white/20 px-2 py-0.5 rounded-full text-xs">Última ronda</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-display text-4xl ${esUltimo ? "text-white" : pct >= 80 ? "text-accent" : pct >= 50 ? "text-secondary-foreground" : "text-destructive"}`}>
                  {resultado.totalAciertos}/{resultado.total}
                </div>
                <div className={`text-sm font-semibold ${esUltimo ? "text-white/80" : "text-muted-foreground"}`}>
                  {pct}% de aciertos
                </div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="h-2 bg-muted">
              <div
                className={`h-full transition-all duration-700 ${pct >= 80 ? "bg-accent" : pct >= 50 ? "bg-secondary" : "bg-destructive"}`}
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Detalle de respuestas */}
            <ul className="divide-y divide-border">
              {resultado.respuestas.map((r, i) => (
                <li
                  key={r.operacionId}
                  data-testid={`respuesta-item-${r.operacionId}`}
                  className={`flex items-center gap-3 px-6 py-3 ${r.esCorrecta ? "bg-accent/5" : "bg-destructive/5"}`}
                >
                  <span className="text-muted-foreground text-sm w-6 text-center font-mono">{i + 1}</span>
                  <span className="flex-1 font-mono font-bold text-foreground text-lg">{r.textoOperacion}</span>
                  <div className="text-right space-y-0.5 min-w-24">
                    <div className="text-xs text-muted-foreground">Correcto: <strong className="text-foreground font-mono">{r.respuestaCorrecta}</strong></div>
                    <div className="text-xs text-muted-foreground">
                      Alumno: <strong className={`font-mono ${r.esCorrecta ? "text-accent" : "text-destructive"}`}>
                        {r.respuestaAlumno || "(sin respuesta)"}
                      </strong>
                    </div>
                  </div>
                  {r.esCorrecta ? (
                    <CheckCircle2 className="w-6 h-6 text-accent flex-shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive flex-shrink-0" />
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
