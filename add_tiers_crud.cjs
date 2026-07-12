const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetIdx = code.indexOf('// Apply migrations');

const apis = `
// ================= NEW MEMBER TIERS CRUD APIS =================
app.get('/api/admin/tiers', authenticateAdmin, async (req, res) => {
  const allTiers = await db.query.memberLevels.findMany({
    orderBy: [asc(schema.memberLevels.minSpendCents)]
  });
  res.json({ success: true, tiers: allTiers });
});
app.post('/api/admin/tiers', authenticateAdmin, async (req, res) => {
  const newId = \`tier_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.memberLevels).values({ id: newId, ...req.body });
  res.json({ success: true, id: newId });
});
app.patch('/api/admin/tiers/:id', authenticateAdmin, async (req, res) => {
  await db.update(schema.memberLevels).set(req.body).where(eq(schema.memberLevels.id, req.params.id));
  res.json({ success: true });
});
app.delete('/api/admin/tiers/:id', authenticateAdmin, async (req, res) => {
  await db.delete(schema.memberLevels).where(eq(schema.memberLevels.id, req.params.id));
  res.json({ success: true });
});
`;

const newCode = code.substring(0, targetIdx) + apis + code.substring(targetIdx);
fs.writeFileSync('server.ts', newCode);
