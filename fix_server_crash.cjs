const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace standard route handlers with try-catch blocks to prevent crashes
code = code.replace(
  /app\.get\('\/api\/categories', async \(req, res\) => \{\n  const list = await db\.query\.categories\.findMany\(\{ where: eq\(schema\.categories\.disabled, false\) \}\);\n  res\.json\(list\);\n\}\);/g,
  `app.get('/api/categories', async (req, res) => {
  try {
    const list = await db.query.categories.findMany({ where: eq(schema.categories.disabled, false) });
    res.json(list);
  } catch (err) {
    console.error('DB Error /api/categories:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});`
);

fs.writeFileSync('server.ts', code);
