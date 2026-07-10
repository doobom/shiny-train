const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf-8');

code = code.replace(/import pool from '\.\/postgres_pool\.js';/, "import { client } from './db.js';");
code = code.replace(/await pool\.query\(schemaSql\);/, "await client.exec(schemaSql);");

fs.writeFileSync('src/server/seed.ts', code);
