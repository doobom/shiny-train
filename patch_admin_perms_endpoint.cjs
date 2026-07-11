const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const permEndpoint = `
app.patch('/api/admin/users/:id/permissions', authenticateAdmin, async (req, res) => {
  try {
    const { permissions } = req.body;
    await db.update(schema.users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(schema.users.id, req.params.id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 'SERVER_ERROR' });
  }
});
`;

if (!code.includes('/api/admin/users/:id/permissions')) {
  code = code.replace(
    /app\.patch\('\/api\/admin\/users\/:id\/tier', authenticateAdmin, async \(req, res\) => \{[\s\S]*?\}\);/,
    `$&${permEndpoint}`
  );
  fs.writeFileSync('server.ts', code);
}
