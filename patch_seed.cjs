const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

// Replace product insertions to explicitly include status, createdAt, updatedAt
code = code.replace(/images: \[/g, "status: 'on_shelf',\n        createdAt: new Date(),\n        updatedAt: new Date(),\n        images: [");

fs.writeFileSync('src/server/seed.ts', code);
