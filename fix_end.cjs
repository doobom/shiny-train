const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.trim();
if (code.endsWith('}')) {
  code += ');\n}';
}
fs.writeFileSync('server.ts', code + '\n');
