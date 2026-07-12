const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

code = code.replace(
  `if ((!process.env.NODE_ENV || process.env.NODE_ENV === 'production') && process.env.DATABASE_URL) {`,
  `const isProd = (!process.env.NODE_ENV && !!process.env.DATABASE_URL) || process.env.NODE_ENV === 'production';\nif (isProd && process.env.DATABASE_URL) {`
);

fs.writeFileSync('src/server/db.ts', code);
