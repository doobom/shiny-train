const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/require\('path'\)/g, 'path');
fs.writeFileSync('server.ts', code);
