const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(/import \{.*?\} from 'drizzle-orm\/pg-core';/, "import { sqliteTable as pgTable, integer, text as varchar, text, real as doublePrecision, integer as boolean, integer as timestamp, text as jsonb } from 'drizzle-orm/sqlite-core';");
code = code.replace(/serial\((.*?)\)/g, 'integer($1, { mode: "number" }).primaryKey({ autoIncrement: true })');

fs.writeFileSync('src/server/schema.ts', code);
console.log("Schema rewritten");
