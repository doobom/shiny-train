const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/rowCount/g, "changes");

fs.writeFileSync('server.ts', code);
console.log("RunResult fix applied");
