const fs = require('fs');

let schema = fs.readFileSync('src/server/schema.ts', 'utf8');

// Replace pg-core imports with sqlite-core imports
schema = schema.replace(/import \{.*?\} from 'drizzle-orm\/sqlite-core';/, ""); // remove previous if any
schema = schema.replace(/import \{.*?\} from 'drizzle-orm\/pg-core';/, `import { sqliteTable as pgTable, integer, text, real } from 'drizzle-orm/sqlite-core';`);

// Helper to convert varchar to text
schema = schema.replace(/varchar\((.*?),\s*\{.*?\}\)/g, 'text($1)');
schema = schema.replace(/varchar\((.*?)\)/g, 'text($1)');

// Helper to convert boolean to integer mode boolean
schema = schema.replace(/boolean\((.*?)\)/g, 'integer($1, { mode: "boolean" })');

// Helper to convert timestamp to integer mode timestamp
schema = schema.replace(/timestamp\((.*?)\)/g, 'integer($1, { mode: "timestamp" })');

// Helper to convert jsonb to text mode json
schema = schema.replace(/jsonb\((.*?)\)/g, 'text($1, { mode: "json" })');

// serial is already replaced in previous script, but let's make sure
schema = schema.replace(/serial\((.*?)\)/g, 'integer($1, { mode: "number" }).primaryKey({ autoIncrement: true })');

// doublePrecision to real
schema = schema.replace(/doublePrecision\((.*?)\)/g, 'real($1)');

fs.writeFileSync('src/server/schema.ts', schema);

// Write db.ts
fs.writeFileSync('src/server/db.ts', `
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.js';

// Mock DB with in-memory SQLite for imported project
const sqlite = new Database(':memory:');
export const db = drizzle(sqlite, { schema });
`);

console.log("Schema and db updated");
