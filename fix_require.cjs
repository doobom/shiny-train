const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/require\('drizzle-orm'\).sql/g, 'sql');
fs.writeFileSync('server.ts', code);
