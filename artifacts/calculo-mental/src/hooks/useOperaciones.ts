import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Operacion } from "@/types";

interface OperacionApi {
  id: number;
  userId: number;
  texto: string;
  respuesta: string | number;
  orden: number;
  createdAt: string;
}

function toOperacion(op: OperacionApi): Operacion {
  return { id: String(op.id), texto: op.texto, respuesta: op.respuesta };
}

const QK = "operaciones";

async function fetchOperaciones(): Promise<Operacion[]> {
  const res = await fetch("/api/operaciones", { credentials: "include" });
  if (!res.ok) throw new Error("Error al cargar operaciones");
  const data = (await res.json()) as OperacionApi[];
  return data.map(toOperacion);
}

export function useOperaciones() {
  const qc = useQueryClient();

  const { data: operaciones = [], isLoading } = useQuery({
    queryKey: [QK],
    queryFn: fetchOperaciones,
    staleTime: 0,
  });

  const agregarMutation = useMutation({
    mutationFn: async ({ texto, respuesta }: { texto: string; respuesta: string | number }) => {
      const res = await fetch("/api/operaciones", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, respuesta }),
      });
      if (!res.ok) throw new Error("Error al agregar operación");
      return (await res.json()) as OperacionApi;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const editarMutation = useMutation({
    mutationFn: async ({
      id,
      texto,
      respuesta,
    }: {
      id: string;
      texto: string;
      respuesta: string | number;
    }) => {
      const res = await fetch(`/api/operaciones/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, respuesta }),
      });
      if (!res.ok) throw new Error("Error al editar operación");
      return (await res.json()) as OperacionApi;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const eliminarMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/operaciones/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar operación");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const mezclarMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/operaciones/mezclar", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al mezclar operaciones");
      return (await res.json()) as OperacionApi[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  const importarMutation = useMutation({
    mutationFn: async (
      ops: { texto: string; respuesta: string | number }[]
    ) => {
      const res = await fetch("/api/operaciones/importar", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operaciones: ops }),
      });
      if (!res.ok) throw new Error("Error al importar operaciones");
      return (await res.json()) as OperacionApi[];
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [QK] }),
  });

  return {
    operaciones,
    isLoading,
    agregarOperacion: (texto: string, respuesta: string | number) =>
      agregarMutation.mutate({ texto, respuesta }),
    editarOperacion: (id: string, texto: string, respuesta: string | number) =>
      editarMutation.mutate({ id, texto, respuesta }),
    eliminarOperacion: (id: string) => eliminarMutation.mutate(id),
    mezclarOperaciones: () => mezclarMutation.mutate(),
    importarOperaciones: (ops: { texto: string; respuesta: string | number }[]) =>
      importarMutation.mutateAsync(ops),
  };
}
