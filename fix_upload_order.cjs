const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /(app\.post\('\/api\/admin\/upload'[\s\S]*?res\.json\(\{ success: true, url \}\);\n\}\);)/;
const match = regex.exec(code);
if (match) {
  const uploadRoute = match[1];
  code = code.replace(uploadRoute, '');
  code = code.replace(/const authenticateAdmin = [\s\S]*?next\(\);\n  \}\);\n\};/, (m) => m + '\n\n' + uploadRoute);
  fs.writeFileSync('server.ts', code);
}
