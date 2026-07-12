const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.post('/api/admin/users', authenticateAdmin, requirePermission('manage_users'), async (req, res) => {`;
const replace = `app.post('/api/admin/users/invite', authenticateAdmin, requirePermission('manage_users'), async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ code: 'INVALID_INPUT' });
  
  // Just create user directly with a random password if they don't exist
  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (existing) {
    if (existing.role !== 'admin') {
      await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, existing.id));
    }
    return res.json({ success: true, message: 'Existing user upgraded to admin' });
  }

  const rawPassword = require('crypto').randomBytes(8).toString('hex');
  const pepper = process.env.PASSWORD_SALT || '';
  const hashedPassword = await bcrypt.hash(rawPassword + pepper, await bcrypt.genSalt(10));
  
  await db.insert(schema.users).values({
    id: \`usr_\${require('uuid').v4().substring(0, 8)}\`,
    email,
    passwordHash: hashedPassword,
    role: 'admin',
    tier: 'standard'
  });
  res.json({ success: true, message: 'Admin invited', tempPassword: rawPassword });
});

app.post('/api/admin/users', authenticateAdmin, requirePermission('manage_users'), async (req, res) => {`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
