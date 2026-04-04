import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shuffle, Play, ArrowRight, ArrowLeft, Eye, EyeOff, RotateCcw,
  Timer, ChevronRight, Maximize, Minimize, CheckCircle2, XCircle, Zap,
} from "lucide-react";
import type { Alumno, Operacion, ModoJuego, ResultadoRonda, RespuestaAlumno } from "../types";

interface JuegoProps {
  alumnos: Alumno[];
  operaciones: Operacion[];
  onMarcarUsado: (id: string) => void;
  onGuardarResultado: (resultado: ResultadoRonda) => void;
  onCambiarVista: (vista: "resultados") => void;
}

type EstadoJuego = "selector" | "jugando" | "terminado";

export function Juego({ alumnos, operaciones, onMarcarUsado, onGuardarResultado, onCambiarVista }: JuegoProps) {
  const [estado, setEstado] = useState<EstadoJuego>("selector");
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<Alumno | null>(null);
  const [animandoPick, setAnimandoPick] = useState(false);
  const [nombreAnimado, setNombreAnimado] = useState("");
  const [opActual, setOpActual] = useState(0);
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);
  const [modo, setModo] = useState<ModoJuego>("simple");
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [respuestaInput, setRespuestaInput] = useState("");
  const [tiempoHabilitado, setTiempoHabilitado] = useState(false);
  const [tiempoSegundos, setTiempoSegundos] = useState(15);
  const [tiempoRestante, setTiempoRestante] = useState(15);
  const [tiempoActivo, setTiempoActivo] = useState(false);
  const [limitarOps, setLimitarOps] = useState(false);
  const [limiteOps, setLimiteOps] = useState(5);
  const [opcionNoRepetir, setOpcionNoRepetir] = useState(true);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [opsRonda, setOpsRonda] = useState<Operacion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const juegoRef = useRef<HTMLDivElement>(null);

  const alumnosDisponibles = opcionNoRepetir
    ? alumnos.filter((a) => !a.usado)
    : alumnos;

  const elegirAlumnoAzar = () => {
    if (alumnosDisponibles.length === 0) return;
    setAnimandoPick(true);
    let count = 0;
    const total = 20;
    const interval = setInterval(() => {
      const rand = alumnosDisponibles[Math.floor(Math.random() * alumnosDisponibles.length)];
      setNombreAnimado(rand.nombre);
      count++;
      if (count >= total) {
        clearInterval(interval);
        setAnimandoPick(false);
        setAlumnoSeleccionado(rand);
        setNombreAnimado("");
      }
    }, 80);
  };

  const iniciarRonda = () => {
    let ops = [...operaciones];
    if (limitarOps) ops = ops.slice(0, limiteOps);
    setOpsRonda(ops);
    setOpActual(0);
    setMostrarRespuesta(false);
    setRespuestas({});
    setRespuestaInput("");
    setEstado("jugando");
    if (alumnoSeleccionado) onMarcarUsado(alumnoSeleccionado.id);
    if (tiempoHabilitado) {
      setTiempoRestante(tiempoSegundos);
      setTiempoActivo(true);
    }
  };

  const reiniciarSelector = () => {
    setEstado("selector");
    setAlumnoSeleccionado(null);
    setOpsRonda([]);
    setOpActual(0);
    setMostrarRespuesta(false);
    setRespuestas({});
    setRespuestaInput("");
    setTiempoActivo(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const siguienteOp = useCallback(() => {
    if (modo === "interactivo") {
      const op = opsRonda[opActual];
      setRespuestas((prev) => ({ ...prev, [op.id]: respuestaInput }));
    }
    setMostrarRespuesta(false);
    setRespuestaInput("");
    if (opActual < opsRonda.length - 1) {
      setOpActual((prev) => prev + 1);
      if (tiempoHabilitado) {
        setTiempoRestante(tiempoSegundos);
        setTiempoActivo(true);
      }
    } else {
      terminarRonda();
    }
  }, [modo, opActual, opsRonda, respuestaInput, tiempoHabilitado, tiempoSegundos]);

  const anteriorOp = () => {
    if (opActual > 0) {
      setOpActual((prev) => prev - 1);
      setMostrarRespuesta(false);
      setRespuestaInput(respuestas[opsRonda[opActual - 1]?.id] ?? "");
    }
  };

  const terminarRonda = useCallback(() => {
    setTiempoActivo(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const currentRespuestas = { ...respuestas };
    if (modo === "interactivo" && opsRonda[opActual]) {
      currentRespuestas[opsRonda[opActual].id] = respuestaInput;
    }

    if (modo === "interactivo" && alumnoSeleccionado) {
      const resultado: RespuestaAlumno[] = opsRonda.map((op) => {
        const rAlumno = currentRespuestas[op.id] ?? "";
        const esCorrecta =
          rAlumno.trim().toLowerCase() === String(op.respuesta).trim().toLowerCase();
        return {
          operacionId: op.id,
          textoOperacion: op.texto,
          respuestaCorrecta: op.respuesta,
          respuestaAlumno: rAlumno,
          esCorrecta,
        };
      });
      const total = resultado.length;
      const aciertos = resultado.filter((r) => r.esCorrecta).length;
      onGuardarResultado({
        alumno: alumnoSeleccionado,
        respuestas: resultado,
        totalAciertos: aciertos,
        total,
        timestamp: Date.now(),
      });
    }
    setEstado("terminado");
  }, [respuestas, modo, opsRonda, opActual, respuestaInput, alumnoSeleccionado, onGuardarResultado]);

  // Timer
  useEffect(() => {
    if (tiempoActivo && tiempoHabilitado) {
      timerRef.current = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setTiempoActivo(false);
            setMostrarRespuesta(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tiempoActivo, tiempoHabilitado, opActual]);

  // Focus input
  useEffect(() => {
    if (estado === "jugando" && modo === "interactivo") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [estado, opActual, modo]);

  // Fullscreen
  const togglePantallaCompleta = () => {
    if (!pantallaCompleta) {
      juegoRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setPantallaCompleta(!pantallaCompleta);
  };

  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) setPantallaCompleta(false);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const opcionesNoRepetirDisponible = alumnos.some((a) => !a.usado);
  const tiempoPorcentaje = (tiempoRestante / tiempoSegundos) * 100;

  // --- SELECTOR ---
  if (estado === "selector") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-3xl text-foreground flex items-center gap-2">
            <Zap className="w-7 h-7 text-primary" />
            Panel de Juego
          </h2>
        </div>

        {alumnos.length === 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 text-center">
            <p className="font-bold text-destructive">No hay alumnos registrados.</p>
            <p className="text-muted-foreground text-sm">Ve a la sección Alumnos y agrega alumnos para jugar.</p>
          </div>
        )}
        {operaciones.length === 0 && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-5 text-center">
            <p className="font-bold text-destructive">No hay operaciones capturadas.</p>
            <p className="text-muted-foreground text-sm">Ve a la sección Operaciones y agrega operaciones para jugar.</p>
          </div>
        )}

        {alumnos.length > 0 && operaciones.length > 0 && (
          <>
            {/* Opciones */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Modo */}
              <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-base">Modo de juego</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "simple" as ModoJuego, label: "Simple", desc: "Solo muestra las operaciones" },
                    { id: "interactivo" as ModoJuego, label: "Interactivo", desc: "El alumno escribe respuestas" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      data-testid={`modo-${m.id}`}
                      onClick={() => setModo(m.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        modo === m.id
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:border-muted-foreground"
                      }`}
                    >
                      <div className="font-bold text-sm">{m.label}</div>
                      <div className="text-xs text-muted-foreground">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Opciones extra */}
              <div className="bg-card border border-card-border rounded-2xl p-5 space-y-3">
                <h3 className="font-bold text-base">Opciones</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setOpcionNoRepetir(!opcionNoRepetir)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${opcionNoRepetir ? "bg-primary" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${opcionNoRepetir ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium">No repetir alumnos hasta agotar la lista</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setTiempoHabilitado(!tiempoHabilitado)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${tiempoHabilitado ? "bg-primary" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${tiempoHabilitado ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium">Temporizador por operación</span>
                  {tiempoHabilitado && (
                    <input
                      type="number"
                      min={5}
                      max={120}
                      value={tiempoSegundos}
                      onChange={(e) => setTiempoSegundos(Math.max(5, parseInt(e.target.value) || 15))}
                      className="w-16 px-2 py-1 text-sm border border-input rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                  {tiempoHabilitado && <span className="text-sm text-muted-foreground">seg</span>}
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setLimitarOps(!limitarOps)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${limitarOps ? "bg-primary" : "bg-muted"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${limitarOps ? "translate-x-5" : "translate-x-0.5"}`} />
                  </div>
                  <span className="text-sm font-medium">Limitar operaciones por ronda</span>
                  {limitarOps && (
                    <input
                      type="number"
                      min={1}
                      max={operaciones.length}
                      value={limiteOps}
                      onChange={(e) => setLimiteOps(Math.max(1, parseInt(e.target.value) || 5))}
                      className="w-16 px-2 py-1 text-sm border border-input rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  )}
                </label>
              </div>
            </div>

            {/* Selector de alumno */}
            <div className="bg-card border border-card-border rounded-2xl p-6 text-center space-y-4">
              {opcionNoRepetir && alumnosDisponibles.length === 0 ? (
                <div className="space-y-3">
                  <div className="text-4xl">🎉</div>
                  <p className="font-bold text-lg">¡Todos los alumnos ya participaron!</p>
                  <p className="text-muted-foreground text-sm">Activa "Resetear participación" en la sección de Alumnos para volver a empezar.</p>
                </div>
              ) : (
                <>
                  {alumnoSeleccionado ? (
                    <div className="space-y-2">
                      <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Alumno seleccionado</div>
                      <div className="font-display text-4xl md:text-5xl text-primary animate-bounce-in animate-pulse-glow bg-primary/5 py-5 px-6 rounded-2xl">
                        {alumnoSeleccionado.nombre}
                      </div>
                      <div className="flex justify-center gap-3 pt-2">
                        <button
                          data-testid="btn-nuevo-alumno"
                          onClick={elegirAlumnoAzar}
                          disabled={animandoPick}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold transition-all"
                        >
                          <Shuffle className="w-4 h-4" />
                          Elegir otro
                        </button>
                        <button
                          data-testid="btn-iniciar-ronda"
                          onClick={iniciarRonda}
                          className="bg-primary text-primary-foreground font-bold px-6 py-2 rounded-xl hover:shadow-md transition-all flex items-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Iniciar ronda
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {animandoPick && (
                        <div className="font-display text-4xl md:text-5xl text-primary bg-primary/5 py-5 px-6 rounded-2xl">
                          {nombreAnimado}
                        </div>
                      )}
                      <button
                        data-testid="btn-elegir-alumno"
                        onClick={elegirAlumnoAzar}
                        disabled={animandoPick || alumnosDisponibles.length === 0}
                        className="bg-primary text-primary-foreground font-bold text-xl px-8 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
                      >
                        <Shuffle className="w-6 h-6" />
                        Elegir alumno al azar
                      </button>
                      {opcionNoRepetir && (
                        <p className="text-muted-foreground text-sm">
                          {alumnosDisponibles.length} de {alumnos.length} alumno{alumnos.length !== 1 ? "s" : ""} disponible{alumnosDisponibles.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // --- JUGANDO ---
  if (estado === "jugando") {
    const opActualObj = opsRonda[opActual];
    const progreso = ((opActual + 1) / opsRonda.length) * 100;
    const tiempoColor = tiempoRestante <= 5 ? "bg-destructive" : tiempoRestante <= 10 ? "bg-secondary" : "bg-accent";

    return (
      <div ref={juegoRef} className={`space-y-4 ${pantallaCompleta ? "fixed inset-0 z-50 bg-background p-8 overflow-auto" : ""}`}>
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary font-display text-xl px-4 py-1.5 rounded-xl">
              {alumnoSeleccionado?.nombre}
            </div>
            <span className="text-muted-foreground text-sm font-semibold">
              Operación {opActual + 1} / {opsRonda.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={togglePantallaCompleta}
              className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"
              title="Pantalla completa"
            >
              {pantallaCompleta ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
            <button
              data-testid="btn-terminar-ronda"
              onClick={terminarRonda}
              className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Terminar ronda
            </button>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-muted rounded-full h-3 overflow-hidden">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${progreso}%` }}
          />
        </div>

        {/* Timer */}
        {tiempoHabilitado && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground font-medium">
                <Timer className="w-4 h-4" />
                Tiempo
              </span>
              <span className={`font-display text-2xl ${tiempoRestante <= 5 ? "text-destructive animate-countdown-tick" : "text-foreground"}`}>
                {tiempoRestante}s
              </span>
            </div>
            <div className="bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${tiempoColor}`}
                style={{ width: `${tiempoPorcentaje}%` }}
              />
            </div>
          </div>
        )}

        {/* Operación */}
        <div className="bg-card border border-card-border rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-lg">
          <div className="font-display text-6xl md:text-8xl lg:text-9xl text-foreground tracking-tight">
            {opActualObj?.texto}
          </div>

          {mostrarRespuesta && (
            <div className="animate-bounce-in">
              <div className="text-muted-foreground text-lg mb-1">Respuesta correcta:</div>
              <div className="font-display text-5xl md:text-7xl text-accent">
                {opActualObj?.respuesta}
              </div>
            </div>
          )}

          {modo === "interactivo" && !mostrarRespuesta && (
            <div className="flex justify-center">
              <input
                ref={inputRef}
                data-testid="input-respuesta-juego"
                type="text"
                value={respuestaInput}
                onChange={(e) => setRespuestaInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && siguienteOp()}
                placeholder="Escribe tu respuesta..."
                className="text-center font-display text-3xl w-full max-w-xs px-6 py-4 rounded-2xl border-2 border-input bg-background focus:outline-none focus:ring-4 focus:ring-primary focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={anteriorOp}
            disabled={opActual === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:shadow text-sm font-semibold transition-all disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </button>

          <button
            data-testid="btn-mostrar-respuesta"
            onClick={() => setMostrarRespuesta(!mostrarRespuesta)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border bg-card hover:shadow text-sm font-semibold transition-all"
          >
            {mostrarRespuesta ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {mostrarRespuesta ? "Ocultar respuesta" : "Mostrar respuesta"}
          </button>

          <button
            data-testid="btn-siguiente"
            onClick={siguienteOp}
            className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:shadow-md transition-all flex items-center gap-2"
          >
            {opActual < opsRonda.length - 1 ? (
              <>Siguiente <ArrowRight className="w-5 h-5" /></>
            ) : (
              <>Finalizar <CheckCircle2 className="w-5 h-5" /></>
            )}
          </button>
        </div>

        {/* Mini lista */}
        <div className="flex gap-2 flex-wrap justify-center">
          {opsRonda.map((op, i) => (
            <button
              key={op.id}
              onClick={() => {
                if (modo === "interactivo") {
                  setRespuestas((prev) => ({ ...prev, [opsRonda[opActual].id]: respuestaInput }));
                  setRespuestaInput(respuestas[op.id] ?? "");
                }
                setOpActual(i);
                setMostrarRespuesta(false);
              }}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                i === opActual
                  ? "bg-primary text-primary-foreground scale-110"
                  : i < opActual
                  ? "bg-accent/20 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- TERMINADO ---
  return (
    <div className="space-y-6 text-center">
      <div className="animate-bounce-in">
        <div className="text-7xl mb-4">🎉</div>
        <h2 className="font-display text-4xl text-primary">¡Ronda terminada!</h2>
        <p className="text-muted-foreground mt-2">
          Alumno: <strong className="text-foreground">{alumnoSeleccionado?.nombre}</strong>
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          data-testid="btn-nueva-ronda"
          onClick={reiniciarSelector}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card hover:shadow font-semibold transition-all"
        >
          <RotateCcw className="w-5 h-5" />
          Nueva ronda
        </button>
        {modo === "interactivo" && (
          <button
            data-testid="btn-ver-resultados"
            onClick={() => onCambiarVista("resultados")}
            className="bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            Ver resultados
          </button>
        )}
      </div>

      {modo === "simple" && (
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden text-left">
          <div className="px-5 py-3 bg-muted/50 font-bold text-sm uppercase tracking-wide text-muted-foreground">
            Respuestas correctas
          </div>
          <ul className="divide-y divide-border">
            {opsRonda.map((op) => (
              <li key={op.id} className="flex items-center justify-between px-5 py-3">
                <span className="font-mono font-bold text-lg text-foreground">{op.texto}</span>
                <span className="font-display text-2xl text-accent">{op.respuesta}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
