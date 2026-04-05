import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const operacionesTable = pgTable("operaciones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  respuesta: text("respuesta").notNull(),
  orden: integer("orden").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Operacion = typeof operacionesTable.$inferSelect;
export type InsertOperacion = typeof operacionesTable.$inferInsert;
