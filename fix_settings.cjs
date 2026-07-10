const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetGet = `app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  res.json({
    reductions: [],
    shipping: []
  });
});`;

const replacementGet = `app.get('/api/admin/settings', authenticateToken, async (req, res) => {
  const settings = await db.query.platformSettings.findMany();
  res.json(settings);
});`;

code = code.replace(targetGet, replacementGet);

const targetPatch = `app.patch('/api/admin/settings', authenticateToken, async (req, res) => {
  res.json({ success: true });
});`;

const replacementPatch = `app.patch('/api/admin/settings', authenticateToken, async (req, res) => {
  const payload = req.body;
  await db.transaction(async (tx) => {
    for (const [key, value] of Object.entries(payload)) {
      const existing = await tx.query.platformSettings.findFirst({ where: eq(schema.platformSettings.key, key) });
      if (existing) {
        await tx.update(schema.platformSettings).set({ value }).where(eq(schema.platformSettings.key, key));
      } else {
        await tx.insert(schema.platformSettings).values({ key, value });
      }
    }
  });
  res.json({ success: true });
});`;

code = code.replace(targetPatch, replacementPatch);
fs.writeFileSync('server.ts', code);
