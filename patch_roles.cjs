const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetToRemove = `app.get('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const roles = await db.query.roles.findMany();
  res.json(roles);
});
app.post('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const { code, nameZh, nameEn } = req.body;
  const id = 'rol_' + require('uuid').v4().substring(0, 8);
  await db.insert(schema.roles).values({ id, code, nameZh, nameEn });
  res.json({ success: true, id });
});
app.get('/api/admin/permissions/catalog', authenticateAdmin, async (req, res) => {
  res.json(['products', 'orders', 'users', 'marketing', 'settings']);
});`;

code = code.replace(targetToRemove, '');

fs.writeFileSync('server.ts', code);
