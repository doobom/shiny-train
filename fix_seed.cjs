const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

code = code.replace(/import pool from '\.\/postgres_pool\.js';/, '');
code = code.replace(/try \{[\s\S]*?console\.log\('Schema created successfully\.'\);[\s\S]*?\} catch \(err\) \{[\s\S]*?\}/, 'console.log("Schema is managed by drizzle sqlite");');

fs.writeFileSync('src/server/seed.ts', code);
