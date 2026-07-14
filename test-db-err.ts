import { db } from './src/server/db.js';
import * as schema from './src/server/schema.js';
import { eq } from 'drizzle-orm';
async function run() {
  try {
    await db.query.users.findFirst({ where: eq(schema.users.email, "test@test.com") });
  } catch (e: any) {
    console.error("Full Error:");
    console.error(e);
    if (e.cause) console.error("Cause:", e.cause);
  }
}
run();
