const { Pool } = require('pg');
const { drizzle } = require('drizzle-orm/node-postgres');
const { migrate } = require('drizzle-orm/node-postgres/migrator');

async function run() {
  const url = process.env.DATABASE_URL;
  const regex = /^postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/;
  const match = url.match(regex);
  let poolConfig = { connectionString: url };
  if (match) {
    const [_, user, password, host, portStr, database] = match;
    poolConfig = { user, password, host, port: parseInt(portStr), database };
  }
  const pool = new Pool(poolConfig);
  const db = drizzle({ client: pool });
  console.log("Running migration manually...");
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log("Migration successful");
  } catch (e) {
    console.error("Migration failed:", e);
  }
  pool.end();
}
run();
