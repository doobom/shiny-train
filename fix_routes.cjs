const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The original one we matched with sed:
code = code.replace(/app\.put\('\/api\/admin\/products\/:id'[\s\S]*?\}\);\n/, "");

fs.writeFileSync('server.ts', code);
