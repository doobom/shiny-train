const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes('compression(')) {
  code = code.replace("import express from 'express';", "import express from 'express';\nimport compression from 'compression';");
  code = code.replace("const app = express();", "const app = express();\napp.use(compression());");
  fs.writeFileSync('server.ts', code);
}
