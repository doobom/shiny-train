import { db } from './src/server/db.js';
import { sql } from 'drizzle-orm';
async function run() {
  const res = await db.execute(sql`SELECT * FROM users`);
  console.log(res.rows);
}
run();
