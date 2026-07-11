const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import { migrate } from './src/server/db.js';")) {
  code = "import { migrate } from './src/server/db.js';\n" + code;
}

code = code.replace("async function startServer() {", "async function startServer() {\n  try {\n    await migrate();\n  } catch (e) {\n    console.error('Migration error:', e);\n  }");

fs.writeFileSync('server.ts', code);
