import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { logger } from "./lib/logger";

async function seed() {
  const adminEmail = "admin@correo.com";

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, adminEmail));

  if (existing) {
    logger.info({ email: adminEmail }, "Super admin already exists, skipping seed");
    return;
  }

  const hashed = await bcrypt.hash("Admin123!", 12);

  await db.insert(usersTable).values({
    name: "Super Admin",
    email: adminEmail,
    password: hashed,
    role: "admin",
  });

  logger.info({ email: adminEmail }, "Super admin created successfully");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error(err, "Seed failed");
    process.exit(1);
  });
