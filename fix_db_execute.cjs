const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

if (!code.includes("import { sql } from 'drizzle-orm';")) {
  code = "import { sql } from 'drizzle-orm';\n" + code;
}

code = code.replace(/await db\.execute\('([^']+)'\)/g, "await db.execute(sql`$1`)");

fs.writeFileSync('src/server/db.ts', code);
