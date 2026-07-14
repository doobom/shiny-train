import { db } from './src/server/db.js';
import { sql } from 'drizzle-orm';
async function run() {
  const res = await db.execute(sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'`);
  console.log(res.rows);
}
run();
