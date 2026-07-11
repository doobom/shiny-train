const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(/import \{.*?\} from 'drizzle-orm\/sqlite-core';/, "import { pgTable, serial, varchar, text, integer, boolean, timestamp, jsonb, doublePrecision } from 'drizzle-orm/pg-core';");

code = code.replace(/integer\('id', \{ mode: "number" \}\)\.primaryKey\(\{ autoIncrement: true \}\)/g, "serial('id').primaryKey()");
// Wait, I actually changed boolean to integer(..., {mode: "boolean"})
code = code.replace(/integer\((.*?),\s*\{ mode: "boolean" \}\)/g, "boolean($1)");
// timestamp
code = code.replace(/integer\((.*?),\s*\{ mode: "timestamp" \}\)/g, "timestamp($1)");
// jsonb
code = code.replace(/text\((.*?),\s*\{ mode: "json" \}\)/g, "jsonb($1)");
// doublePrecision
code = code.replace(/real\((.*?)\)/g, "doublePrecision($1)");

fs.writeFileSync('src/server/schema.ts', code);
console.log("Restored to pg");
