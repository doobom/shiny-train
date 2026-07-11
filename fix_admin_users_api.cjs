const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("app.get('/api/admin/users'")) {
  code = code.replace(
    /app\.get\('\/api\/admin\/dashboard', authenticateToken, async \(req, res\) => \{/,
    `app.get('/api/admin/users', authenticateToken, async (req, res) => {
  const usersList = await db.query.users.findMany({
    columns: { id: true, email: true, role: true, tier: true, status: true, createdAt: true }
  });
  res.json({ success: true, users: usersList });
});

app.patch('/api/admin/users/:id/role', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  await db.update(schema.users).set({ role }).where(eq(schema.users.id, id));
  res.json({ success: true });
});

app.get('/api/admin/dashboard', authenticateToken, async (req, res) => {`
  );
  fs.writeFileSync('server.ts', code);
}
