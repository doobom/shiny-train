const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("import multer from 'multer';", ""); // remove the second one
code = `import multer from 'multer';\nimport { parse } from 'csv-parse/sync';\n` + code;

fs.writeFileSync('server.ts', code);
