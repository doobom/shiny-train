const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace("const multer = require('multer');", "import multer from 'multer';");
code = code.replace("const { parse } = require('csv-parse/sync');", "import { parse } from 'csv-parse/sync';");

fs.writeFileSync('server.ts', code);
console.log("Require replaced");
