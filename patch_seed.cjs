const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

const adminInit = `
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const existingAdmin = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminEmail) });
  
  if (!existingAdmin) {
    await db.insert(schema.users).values({
      id: \`usr_\${uuidv4().substring(0, 8)}\`,
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword + (process.env.PASSWORD_SALT || ''), await bcrypt.genSalt(10)),
      locale: 'zh-HK',
      status: 'active',
      role: 'admin',
      permissions: ['all']
    });
    console.log(\`Admin user created: \${adminEmail}\`);
  }
`;

code = code.replace(
  /const adminEmail = 'admin@example\.com';[\s\S]*?console\.log\('Admin user created\.'\);\n  \}/,
  adminInit
);

fs.writeFileSync('src/server/seed.ts', code);
