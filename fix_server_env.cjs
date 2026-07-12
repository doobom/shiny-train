const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `if (process.env.NODE_ENV !== 'production') {`;
code = code.replace(target, `const isProduction = process.env.NODE_ENV === 'production' || (!process.env.NODE_ENV && !!process.env.DATABASE_URL);\nif (!isProduction) {`);

fs.writeFileSync('server.ts', code);
