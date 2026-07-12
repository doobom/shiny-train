const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetIdx = code.indexOf('// Apply migrations');

const apis = `
// ================= NEW CONTENT CRUD APIS =================
// Banners CRUD
app.post('/api/admin/banners', authenticateAdmin, requirePermission('content'), async (req, res) => {
  const newId = \`ban_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.banners).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/banners/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.update(schema.banners).set(req.body).where(eq(schema.banners.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/banners/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.delete(schema.banners).where(eq(schema.banners.id, req.params.id));
  res.json({ success: true });
});

// Announcements CRUD
app.post('/api/admin/announcements', authenticateAdmin, requirePermission('content'), async (req, res) => {
  const newId = \`ann_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.announcements).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/announcements/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.update(schema.announcements).set(req.body).where(eq(schema.announcements.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/announcements/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.delete(schema.announcements).where(eq(schema.announcements.id, req.params.id));
  res.json({ success: true });
});

// FAQs CRUD
app.post('/api/admin/faqs', authenticateAdmin, requirePermission('content'), async (req, res) => {
  const newId = \`faq_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.faqs).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/faqs/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.update(schema.faqs).set(req.body).where(eq(schema.faqs.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/faqs/:id', authenticateAdmin, requirePermission('content'), async (req, res) => {
  await db.delete(schema.faqs).where(eq(schema.faqs.id, req.params.id));
  res.json({ success: true });
});

`;

const newCode = code.substring(0, targetIdx) + apis + code.substring(targetIdx);
fs.writeFileSync('server.ts', newCode);
