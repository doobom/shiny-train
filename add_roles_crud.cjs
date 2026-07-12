const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetIdx = code.indexOf('// Apply migrations');

const apis = `
// ================= NEW ROLES CRUD APIS =================
// B端：角色与权限管理
app.get('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const allRoles = await db.query.roles.findMany();
  res.json({ success: true, roles: allRoles });
});
app.post('/api/admin/roles', authenticateAdmin, async (req, res) => {
  const newId = \`role_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.roles).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/roles/:id', authenticateAdmin, async (req, res) => {
  await db.update(schema.roles).set(req.body).where(eq(schema.roles.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/roles/:id', authenticateAdmin, async (req, res) => {
  await db.delete(schema.roles).where(eq(schema.roles.id, req.params.id));
  res.json({ success: true });
});

app.get('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {
  const perms = await db.query.rolePermissions.findMany({ where: eq(schema.rolePermissions.roleId, req.params.id) });
  res.json({ success: true, permissions: perms });
});
app.post('/api/admin/roles/:id/permissions', authenticateAdmin, async (req, res) => {
  const { module } = req.body;
  const newId = \`rp_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.rolePermissions).values({ id: newId, roleId: req.params.id, module });
  res.json({ success: true, id: newId });
});
app.delete('/api/admin/roles/:id/permissions/:permId', authenticateAdmin, async (req, res) => {
  await db.delete(schema.rolePermissions).where(eq(schema.rolePermissions.id, req.params.permId));
  res.json({ success: true });
});
`;

const newCode = code.substring(0, targetIdx) + apis + code.substring(targetIdx);
fs.writeFileSync('server.ts', newCode);
