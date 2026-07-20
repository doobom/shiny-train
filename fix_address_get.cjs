const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/res\.json\(\{ addresses \}\);\n+app\.post\('\/api\/user\/addresses'/g, "res.json({ addresses });\n});\n\napp.post('/api/user/addresses'");
fs.writeFileSync('server.ts', code);
