const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("import { migrate } from './src/server/db.js';\n", "");
code = code.replace("import 'dotenv/config';\n", "import 'dotenv/config';\nimport { migrate } from './src/server/db.js';\n");

fs.writeFileSync('server.ts', code);
