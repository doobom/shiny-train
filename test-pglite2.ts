import { drizzle as drizzlePgLite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import * as schema from './src/server/schema.js';
import { migrate } from 'drizzle-orm/pglite/migrator';

async function run() {
  const client = new PGlite('./pglite-data-test');
  const db = drizzlePgLite(client, { schema });
  await migrate(db, { migrationsFolder: './drizzle' });
  try {
    const res = await db.insert(schema.addresses).values({
      id: "addr_123",
      userId: "usr_abc",
      recipient: "Test",
      phone: "123",
      detail: "123",
      isDefault: false,
      remark: "rem"
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
