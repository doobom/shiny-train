const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

if (!code.includes("import bcrypt from 'bcryptjs'")) {
  code = "import bcrypt from 'bcryptjs';\n" + code;
  code = code.replace(/passwordHash: 'admin123'/g, "passwordHash: await bcrypt.hash('admin123', await bcrypt.genSalt(10))");
  fs.writeFileSync('src/server/seed.ts', code);
}
