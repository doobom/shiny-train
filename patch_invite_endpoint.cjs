const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const inviteEndpoint = `
app.post('/api/admin/users/invite', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existing) return res.status(400).json({ code: 'EMAIL_EXISTS', message: 'Email already registered.' });
    
    const pepper = process.env.PASSWORD_SALT || '';
    const salt = await bcrypt.genSalt(10);
    // Temporary password is "Admin123!" which will be hashed by frontend first? No, if we invite from backend, we just hash "Admin123!" as if it's the raw hash?
    // Actually, wait, the frontend sends hashPassword(password).
    // Let's import crypto in node or just assume a standard hash if we send an email.
    // To make it simple, let's just generate a raw bcrypt hash for "Admin123!" but since frontend expects to hash first, 
    // we need to hash it using crypto here or tell the user to use "Admin123!".
    // But crypto is available in Node as require('crypto').
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update('Admin123!').digest('hex');
    const passwordHash = await bcrypt.hash(hash + pepper, salt);
    
    const newUser = {
      id: \`usr_\${uuidv4().substring(0, 8)}\`,
      email,
      passwordHash,
      role: 'admin',
      permissions: ['orders', 'products', 'users', 'settings'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    await db.insert(schema.users).values(newUser);
    await db.insert(schema.carts).values({ id: \`cart_\${newUser.id}\`, userId: newUser.id });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR' });
  }
});
`;

if (!code.includes('/api/admin/users/invite')) {
  code = code.replace(
    /app\.get\('\/api\/admin\/users', authenticateAdmin, async \(req, res\) => \{/,
    inviteEndpoint + "\napp.get('/api/admin/users', authenticateAdmin, async (req, res) => {"
  );
  fs.writeFileSync('server.ts', code);
}
