const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("app.patch('/api/admin/users/:id/tier'")) {
  code = code.replace(
    /app\.patch\('\/api\/admin\/users\/:id\/role', authenticateToken, async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true \};\n\}\);/,
    `app.patch('/api/admin/users/:id/role', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await db.update(schema.users).set({ role }).where(eq(schema.users.id, id));
  res.json({ success: true });
});

app.patch('/api/admin/users/:id/tier', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { tier } = req.body;
  await db.update(schema.users).set({ tier }).where(eq(schema.users.id, id));
  res.json({ success: true });
});`
  );
  fs.writeFileSync('server.ts', code);
}
