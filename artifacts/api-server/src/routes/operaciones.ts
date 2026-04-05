import { Router, type IRouter } from "express";
import { eq, and, max } from "drizzle-orm";
import { db, operacionesTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.use(requireAuth);

// GET /api/operaciones
router.get("/operaciones", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rows = await db
    .select()
    .from(operacionesTable)
    .where(eq(operacionesTable.userId, userId))
    .orderBy(operacionesTable.orden, operacionesTable.createdAt);
  res.json(rows);
});

// POST /api/operaciones
router.post("/operaciones", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { texto, respuesta } = req.body as { texto?: string; respuesta?: string | number };

  if (!texto?.trim() || respuesta === undefined || respuesta === "") {
    res.status(400).json({ error: "Texto y respuesta son requeridos" });
    return;
  }

  const [{ maxOrden }] = await db
    .select({ maxOrden: max(operacionesTable.orden) })
    .from(operacionesTable)
    .where(eq(operacionesTable.userId, userId));

  const [created] = await db
    .insert(operacionesTable)
    .values({
      userId,
      texto: texto.trim(),
      respuesta: String(respuesta),
      orden: (maxOrden ?? 0) + 1,
    })
    .returning();

  res.status(201).json(toFrontend(created));
});

// PUT /api/operaciones/:id
router.put("/operaciones/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const { texto, respuesta } = req.body as { texto?: string; respuesta?: string | number };
  if (!texto?.trim() || respuesta === undefined || respuesta === "") {
    res.status(400).json({ error: "Texto y respuesta son requeridos" });
    return;
  }

  const [updated] = await db
    .update(operacionesTable)
    .set({ texto: texto.trim(), respuesta: String(respuesta) })
    .where(and(eq(operacionesTable.id, id), eq(operacionesTable.userId, userId)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Operación no encontrada" }); return; }
  res.json(toFrontend(updated));
});

// DELETE /api/operaciones/:id
router.delete("/operaciones/:id", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const id = parseInt(req.params.id as string, 10);
  if (isNaN(id)) { res.status(400).json({ error: "ID inválido" }); return; }

  const [deleted] = await db
    .delete(operacionesTable)
    .where(and(eq(operacionesTable.id, id), eq(operacionesTable.userId, userId)))
    .returning();

  if (!deleted) { res.status(404).json({ error: "Operación no encontrada" }); return; }
  res.sendStatus(204);
});

// POST /api/operaciones/mezclar – reordena aleatoriamente
router.post("/operaciones/mezclar", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const rows = await db
    .select()
    .from(operacionesTable)
    .where(eq(operacionesTable.userId, userId));

  const shuffled = [...rows].sort(() => Math.random() - 0.5);

  await Promise.all(
    shuffled.map((op, i) =>
      db
        .update(operacionesTable)
        .set({ orden: i + 1 })
        .where(eq(operacionesTable.id, op.id))
    )
  );

  const updated = await db
    .select()
    .from(operacionesTable)
    .where(eq(operacionesTable.userId, userId))
    .orderBy(operacionesTable.orden);

  res.json(updated.map(toFrontend));
});

// POST /api/operaciones/importar – reemplaza todas las operaciones del usuario
router.post("/operaciones/importar", async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const { operaciones } = req.body as {
    operaciones?: { texto: string; respuesta: string | number }[];
  };

  if (!Array.isArray(operaciones)) {
    res.status(400).json({ error: "Se esperaba un array de operaciones" });
    return;
  }

  await db.delete(operacionesTable).where(eq(operacionesTable.userId, userId));

  if (operaciones.length > 0) {
    await db.insert(operacionesTable).values(
      operaciones.map((op, i) => ({
        userId,
        texto: op.texto,
        respuesta: String(op.respuesta),
        orden: i + 1,
      }))
    );
  }

  const rows = await db
    .select()
    .from(operacionesTable)
    .where(eq(operacionesTable.userId, userId))
    .orderBy(operacionesTable.orden);

  res.json(rows.map(toFrontend));
});

// Convierte respuesta (texto en BD) al tipo correcto para el frontend
function toFrontend(op: typeof operacionesTable.$inferSelect) {
  const num = Number(op.respuesta);
  return { ...op, respuesta: isNaN(num) ? op.respuesta : num };
}

export default router;
