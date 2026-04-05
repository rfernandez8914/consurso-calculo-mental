import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Alumno } from "@/types";

// Shape of an alumno as returned by the API (id is a number)
interface AlumnoApi {
  id: number;
  userId: number;
  nombre: string;
  usado: boolean;
  orden: number;
  createdAt: string;
}

function toAlumno(a: AlumnoApi): Alumno {
  return { id: String(a.id), nombre: a.nombre, usado: a.usado };
}

const QK = "alumnos";

async function fetchAlumnos(): Promise<Alumno[]> {
  const res = await fetch("/api/alumnos", { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar alumnos");
  const data = (await res.json()) as AlumnoApi[];
  return data.map(toAlumno);
}

export function useAlumnos() {
  const qc = useQueryClient();

  const { data: alumnos = [], isLoading } = useQuery({
    queryKey: [QK],
    queryFn: fetchAlumnos,
    staleTime: 0,
  });

  const agregarMutation = useMutation({
    mutationFn: async (nombre: string) => {
      const res = await fetch("/api/alumnos", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error("Error al agregar alumno");
      return (await res.json()) as AlumnoApi;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const editarMutation = useMutation({
    mutationFn: async ({ id, nombre }: { id: string; nombre: string }) => {
      const res = await fetch(`/api/alumnos/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      if (!res.ok) throw new Error("Error al editar alumno");
      return (await res.json()) as AlumnoApi;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const eliminarMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alumnos/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar alumno");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const marcarUsadoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alumnos/${id}/usado`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al marcar alumno");
      return (await res.json()) as AlumnoApi;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const resetearMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/alumnos/reset", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al resetear alumnos");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const importarMutation = useMutation({
    mutationFn: async (alumnos: { nombre: string }[]) => {
      const res = await fetch("/api/alumnos/importar", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alumnos }),
      });
      if (!res.ok) throw new Error("Error al importar alumnos");
      return (await res.json()) as AlumnoApi[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  return {
    alumnos,
    isLoading,
    agregarAlumno: (nombre: string) => agregarMutation.mutate(nombre),
    editarAlumno: (id: string, nombre: string) => editarMutation.mutate({ id, nombre }),
    eliminarAlumno: (id: string) => eliminarMutation.mutate(id),
    marcarAlumnoUsado: (id: string) => marcarUsadoMutation.mutate(id),
    resetearAlumnos: () => resetearMutation.mutate(),
    importarAlumnos: (alumnos: { nombre: string }[]) => importarMutation.mutateAsync(alumnos),
  };
}
