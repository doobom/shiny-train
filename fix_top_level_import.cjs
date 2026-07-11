const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("import multer from 'multer';", ""); // remove the one at 1265 (and actually it might remove the top level one if we aren't careful)
code = code.replace("import { parse } from 'csv-parse/sync';", "");
fs.writeFileSync('server.ts', code);
