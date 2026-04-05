import { useLocalStorage } from "./useLocalStorage";
import type { Alumno, Operacion } from "../types";

const ALUMNOS_INICIALES: Alumno[] = [
  { id: "1", nombre: "Ana García", usado: false },
  { id: "2", nombre: "Carlos López", usado: false },
  { id: "3", nombre: "María Rodríguez", usado: false },
  { id: "4", nombre: "Diego Martínez", usado: false },
  { id: "5", nombre: "Sofía Hernández", usado: false },
];

const OPERACIONES_INICIALES: Operacion[] = [
  { id: "1", texto: "8 + 7", respuesta: 15 },
  { id: "2", texto: "15 - 9", respuesta: 6 },
  { id: "3", texto: "6 × 4", respuesta: 24 },
  { id: "4", texto: "18 ÷ 3", respuesta: 6 },
  { id: "5", texto: "12 + 25", respuesta: 37 },
  { id: "6", texto: "9 × 7", respuesta: 63 },
  { id: "7", texto: "48 - 19", respuesta: 29 },
  { id: "8", texto: "56 ÷ 8", respuesta: 7 },
  { id: "9", texto: "13 + 47", respuesta: 60 },
  { id: "10", texto: "5 × 11", respuesta: 55 },
];

// userId asegura que cada maestro tenga sus propios datos en localStorage
export function useAppData(userId: number) {
  const prefix = `u${userId}`;

  const [alumnos, setAlumnos] = useLocalStorage<Alumno[]>(
    `${prefix}-calculo-alumnos`,
    ALUMNOS_INICIALES,
  );
  const [operaciones, setOperaciones] = useLocalStorage<Operacion[]>(
    `${prefix}-calculo-operaciones`,
    OPERACIONES_INICIALES,
  );

  const agregarAlumno = (nombre: string) => {
    const nuevo: Alumno = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      usado: false,
    };
    setAlumnos((prev) => [...prev, nuevo]);
  };

  const editarAlumno = (id: string, nombre: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, nombre: nombre.trim() } : a))
    );
  };

  const eliminarAlumno = (id: string) => {
    setAlumnos((prev) => prev.filter((a) => a.id !== id));
  };

  const marcarAlumnoUsado = (id: string) => {
    setAlumnos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, usado: true } : a))
    );
  };

  const resetearAlumnos = () => {
    setAlumnos((prev) => prev.map((a) => ({ ...a, usado: false })));
  };

  const agregarOperacion = (texto: string, respuesta: string | number) => {
    const nueva: Operacion = {
      id: Date.now().toString(),
      texto: texto.trim(),
      respuesta,
    };
    setOperaciones((prev) => [...prev, nueva]);
  };

  const editarOperacion = (id: string, texto: string, respuesta: string | number) => {
    setOperaciones((prev) =>
      prev.map((op) =>
        op.id === id ? { ...op, texto: texto.trim(), respuesta } : op
      )
    );
  };

  const eliminarOperacion = (id: string) => {
    setOperaciones((prev) => prev.filter((op) => op.id !== id));
  };

  const mezclarOperaciones = () => {
    setOperaciones((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const exportarDatos = () => {
    const datos = { alumnos, operaciones };
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "concurso-calculo-mental.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importarDatos = (json: string) => {
    try {
      const datos = JSON.parse(json) as { alumnos?: Alumno[]; operaciones?: Operacion[] };
      if (datos.alumnos) setAlumnos(datos.alumnos);
      if (datos.operaciones) setOperaciones(datos.operaciones);
      return true;
    } catch {
      return false;
    }
  };

  return {
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
  };
}
