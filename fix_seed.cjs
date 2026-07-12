const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

if (!code.includes("crypto.createHash")) {
  code = "import crypto from 'crypto';\n" + code;
}

code = code.replace(
  `await bcrypt.hash(adminPassword + (process.env.PASSWORD_SALT || ''), await bcrypt.genSalt(10))`,
  `await bcrypt.hash(crypto.createHash('sha256').update(adminPassword).digest('hex') + (process.env.PASSWORD_SALT || ''), await bcrypt.genSalt(10))`
);

fs.writeFileSync('src/server/seed.ts', code);
