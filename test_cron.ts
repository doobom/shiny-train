import { db } from './src/server/db.js';
import { sql } from 'drizzle-orm';
import * as schema from './src/server/schema.js';
async function test() {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
  try {
    const expiredOrders = await db.query.orders.findMany({
      where: sql`created_at < ${thirtyMinsAgo.toISOString()}`
    });
    console.log("toISOString() works! Found:", expiredOrders.length);
  } catch(e) {
    console.error("Error:", e);
  }
}
test().then(() => process.exit(0));
