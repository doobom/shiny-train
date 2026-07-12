const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

if (!code.includes("import { eq }")) {
  code = "import { eq } from 'drizzle-orm';\n" + code;
}

fs.writeFileSync('src/server/seed.ts', code);
