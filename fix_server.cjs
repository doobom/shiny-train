const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Remove the /api/auth/simulate route
code = code.replace(/app\.post\('\/api\/auth\/simulate', async \(req, res\) => \{[\s\S]*?\}\);\n/g, '');

fs.writeFileSync('server.ts', code);
