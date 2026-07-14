import { db } from './src/server/db.js';
import * as schema from './src/server/schema.js';
import { eq } from 'drizzle-orm';
async function run() {
  try {
    const r = await db.query.users.findFirst({ where: eq(schema.users.email, "ng@ngtau.com") });
    console.log("Success:", r);
  } catch (e) {
    console.log("Error:", e);
  }
}
run();
