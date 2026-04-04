import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users", requireAdmin, async (req, res): Promise<void> => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .orderBy(usersTable.createdAt);

  res.json(users);
});

router.post("/users", requireAdmin, async (req, res): Promise<void> => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password) {
    res.status(400).json({ error: "Nombre, correo y contraseña son requeridos" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    return;
  }

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email.toLowerCase().trim()));

  if (existing) {
    res.status(400).json({ error: "Ya existe un usuario con ese correo" });
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  const [created] = await db
    .insert(usersTable)
    .values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      role: "teacher",
    })
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    });

  req.log.info({ userId: created.id }, "New teacher user created by admin");
  res.status(201).json(created);
});

router.put("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "ID de usuario inválido" });
    return;
  }

  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  if (user.role === "admin" && req.session.userId !== id) {
    res.status(403).json({ error: "No puedes editar a otro administrador" });
    return;
  }

  const updates: { name?: string; email?: string; password?: string } = {};

  if (name && name.trim()) updates.name = name.trim();
  if (email && email.trim()) {
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const [dup] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, normalizedEmail));
      if (dup) {
        res.status(400).json({ error: "Ya existe un usuario con ese correo" });
        return;
      }
    }
    updates.email = normalizedEmail;
  }
  if (password) {
    if (password.length < 6) {
      res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
      return;
    }
    updates.password = await bcrypt.hash(password, 12);
  }

  const [updated] = await db
    .update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    });

  res.json(updated);
});

router.delete("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);

  if (isNaN(id)) {
    res.status(400).json({ error: "ID de usuario inválido" });
    return;
  }

  if (id === req.session.userId) {
    res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!user) {
    res.status(404).json({ error: "Usuario no encontrado" });
    return;
  }

  if (user.role === "admin") {
    res.status(403).json({ error: "No se puede eliminar a un administrador" });
    return;
  }

  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

export default router;
