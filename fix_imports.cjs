const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

if (!code.includes("drizzle-orm/sqlite-core")) {
  code = `import { sqliteTable as pgTable, integer, text, real } from 'drizzle-orm/sqlite-core';\n` + code;
}

fs.writeFileSync('src/server/schema.ts', code);
