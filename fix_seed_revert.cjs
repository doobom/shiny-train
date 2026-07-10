const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf-8');
code = code.replace("import { client } from './db.js';", "import pool from './postgres_pool.js';");
code = code.replace("await client.exec(schemaSql);", "await pool.query(schemaSql);");
fs.writeFileSync('src/server/seed.ts', code);
