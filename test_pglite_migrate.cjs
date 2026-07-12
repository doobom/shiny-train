const { PGlite } = require('@electric-sql/pglite');
const { drizzle } = require('drizzle-orm/pglite');
const { migrate } = require('drizzle-orm/pglite/migrator');

async function run() {
  const client = new PGlite('./pglite-data2');
  const db = drizzle(client);
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("PGLite Migration success");
    const res = await client.query('SELECT * FROM users');
    console.log("Users:", res.rows);
  } catch (e) {
    console.error("Migration failed:", e);
  }
}
run();
