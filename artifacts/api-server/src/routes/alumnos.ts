import { Router, type IRouter } from "express";
import { eq, and, max } from "drizzle-orm";
import { db, alumnosTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAuth);

// GET /api/alumnos – lista del usuario autenticado
router.get("/alumnos", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rows = await db
    .select()
    .from(alumnosTable)
    .where(eq(alumnosTable.userId, userId))
    .orderBy(alumnosTable.orden, alumnosTable.createdAt);
  res.json(rows);
});

// POST /api/alumnos – crear alumno
router.post("/alumnos", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { nombre } = req.body as { nombre?: string };

  if (!nombre?.trim()) {
    res.status(400).json({ error: "El nombre es requerido" });
    return;
  }

  const [{ maxOrden }] = await db
    .select({ maxOrden: max(alumnosTable.orden) })
    .from(alumnosTable)
    .where(eq(alumnosTable.userId, userId));

  const [created] = await db
    .insert(alumnosTable)
    .values({ userId, nombre: nombre.trim(), orden: (maxOrden ?? 0) + 1 })
    .returning();

  res.status(201).json(created);
});

// PUT /api/alumnos/:id – editar nombre
router.put("/alumnos/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const { nombre } = req.body as { nombre?: string };
  if (!nombre?.trim()) { res.status(400).json({ error: "El nombre es requerido" }); return; }

  const [updated] = await db
    .update(alumnosTable)
    .set({ nombre: nombre.trim() })
    .where(and(eq(alumnosTable.id, id), eq(alumnosTable.userId, userId)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Alumno no encontrado" }); return; }
  res.json(updated);
});

// PATCH /api/alumnos/:id/usado – marcar como usado
router.patch("/alumnos/:id/usado", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const [updated] = await db
    .update(alumnosTable)
    .set({ usado: true })
    .where(and(eq(alumnosTable.id, id), eq(alumnosTable.userId, userId)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Alumno no encontrado" }); return; }
  res.json(updated);
});

// POST /api/alumnos/reset – resetear todos (usado = false)
router.post("/alumnos/reset", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  await db
    .update(alumnosTable)
    .set({ usado: false })
    .where(eq(alumnosTable.userId, userId));
  res.sendStatus(204);
});

// DELETE /api/alumnos/:id
router.delete("/alumnos/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const [deleted] = await db
    .delete(alumnosTable)
    .where(and(eq(alumnosTable.id, id), eq(alumnosTable.userId, userId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Alumno no encontrado" }); return; }
  res.sendStatus(204);
});

// POST /api/alumnos/importar – reemplazar todos los alumnos del usuario
router.post("/alumnos/importar", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { alumnos } = req.body as { alumnos?: { nombre: string }[] };

  if (!Array.isArray(alumnos)) {
    res.status(400).json({ error: "Se esperaba un array de alumnos" });
    return;
  }

  await db.delete(alumnosTable).where(eq(alumnosTable.userId, userId));

  if (alumnos.length > 0) {
    await db.insert(alumnosTable).values(
      alumnos.map((a, i) => ({ userId, nombre: a.nombre, orden: i + 1 }))
    );
  }

  const rows = await db
    .select()
    .from(alumnosTable)
    .where(eq(alumnosTable.userId, userId))
    .orderBy(alumnosTable.orden);

  res.json(rows);
});

export default router;
