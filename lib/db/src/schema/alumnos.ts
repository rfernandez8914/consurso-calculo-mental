import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const alumnosTable = pgTable("alumnos", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  nombre: text("nombre").notNull(),
  usado: boolean("usado").notNull().default(false),
  orden: integer("orden").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Alumno = typeof alumnosTable.$inferSelect;
export type InsertAlumno = typeof alumnosTable.$inferInsert;
