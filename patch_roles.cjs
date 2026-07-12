const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {`;
const replace = `
app.get('/api/admin/permissions/catalog', authenticateAdmin, async (req, res) => {
  res.json({
    success: true,
    catalog: [
      { code: 'manage_users', name: 'Manage Users' },
      { code: 'manage_orders', name: 'Manage Orders' },
      { code: 'manage_products', name: 'Manage Products' },
      { code: 'content', name: 'CMS & Marketing' },
      { code: 'settings', name: 'Platform Settings' },
      { code: 'all', name: 'Super Admin (All Access)' }
    ]
  });
});

app.put('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {
  const { permissions } = req.body; // array of strings
  if (!Array.isArray(permissions)) return res.status(400).json({ code: 'INVALID_INPUT' });
  
  await db.transaction(async (tx) => {
    await tx.delete(schema.rolePermissions).where(eq(schema.rolePermissions.roleId, req.params.id));
    for (const p of permissions) {
      await tx.insert(schema.rolePermissions).values({
        id: \`rp_\${require('uuid').v4().substring(0,8)}\`,
        roleId: req.params.id,
        module: p
      });
    }
  });
  
  res.json({ success: true });
});

app.get('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
