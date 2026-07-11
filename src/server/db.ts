import { drizzle as drizzlePgLite } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzleNodePg } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.js';
import { migrate as migratePgLite } from 'drizzle-orm/pglite/migrator';
import { migrate as migrateNodePg } from 'drizzle-orm/node-postgres/migrator';

let db: any;
let migrate: () => Promise<void>;

if (process.env.DATABASE_URL) {
  // Production with PostgreSQL
  const url = process.env.DATABASE_URL;
  const regex = /^postgresql:\/\/(.*?):(.*?)@(.*?):(\d+)\/(.*)$/;
  const match = url.match(regex);
  let poolConfig = { connectionString: url };
  
  if (match) {
    const [_, user, password, host, portStr, database] = match;
    poolConfig = { user, password, host, port: parseInt(portStr), database } as any;
  }
  
  const pool = new Pool(poolConfig);
  db = drizzleNodePg({ client: pool, schema });
  migrate = async () => {
    console.log("Migrating PostgreSQL...");
    await migrateNodePg(db, { migrationsFolder: './drizzle' });
  };
} else {
  // Test/Dev environment with PGlite (SQLite alternative for Postgres schema)
  const client = new PGlite('./pglite-data');
  db = drizzlePgLite(client, { schema });
  migrate = async () => {
    console.log("Migrating PGlite...");
    await migratePgLite(db, { migrationsFolder: './drizzle' });
  };
}

export { db, migrate };
