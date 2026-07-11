import { db } from './src/server/db.js';
import { migrate as migratePgLite } from 'drizzle-orm/pglite/migrator';
import { migrate as migrateNodePg } from 'drizzle-orm/node-postgres/migrator';

export async function runMigrations() {
  console.log("Running migrations...");
  try {
    if (process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
      await migrateNodePg(db, { migrationsFolder: './drizzle' });
    } else {
      await migratePgLite(db, { migrationsFolder: './drizzle' });
    }
    console.log("Migrations complete.");
  } catch (e) {
    console.error("Migration error:", e);
  }
}
