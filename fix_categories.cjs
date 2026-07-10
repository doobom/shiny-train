const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  `app.get('/api/categories', async (req, res) => {
  try {
    const list = await db.query.categories.findMany({ where: eq(schema.categories.disabled, false) });
    res.json(list);
  } catch (err) {
    console.error('DB Error /api/categories:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});`,
  `app.get('/api/categories', async (req, res) => {
  const list = await db.query.categories.findMany({ where: eq(schema.categories.disabled, false) });
  res.json(list);
});`
);

fs.writeFileSync('server.ts', code);
