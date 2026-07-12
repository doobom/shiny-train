const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

code = code.replace(
  `const existingAdmin = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminEmail) });`,
  `const existingAdmin = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminEmail) });
    const pwHash = await bcrypt.hash(crypto.createHash('sha256').update(adminPassword).digest('hex') + (process.env.PASSWORD_SALT || ''), await bcrypt.genSalt(10));
    if (existingAdmin) {
      await db.update(schema.users).set({ passwordHash: pwHash }).where(eq(schema.users.email, adminEmail));
      console.log(\`Admin user password updated: \${adminEmail}\`);
    }`
);

fs.writeFileSync('src/server/seed.ts', code);
