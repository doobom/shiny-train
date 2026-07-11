const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("app.listen(PORT, '0.0.0.0', () => {", "migrate().then(() => { app.listen(PORT, '0.0.0.0', () => {");
fs.writeFileSync('server.ts', code);
