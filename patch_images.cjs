const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/"image_urls" jsonb/g, '"images" jsonb');
code = code.replace(/image_urls JSONB/g, 'images JSONB');
fs.writeFileSync('server.ts', code);
