const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /(res\.json\([^;]+;\n+)(app\.(?:get|post|put|patch|delete)\()/g;
code = code.replace(regex, "$1});\n\n$2");

fs.writeFileSync('server.ts', code);
