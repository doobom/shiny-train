const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf-8');
code = code.replace("console.error('Failed to create schema:', err);", "throw err;");
fs.writeFileSync('src/server/seed.ts', code);
