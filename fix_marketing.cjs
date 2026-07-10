const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const getReductions = `app.get('/api/admin/reductions', authenticateToken, async (req, res) => {
  const reductions = await db.query.fullReductions.findMany({ orderBy: [desc(schema.fullReductions.startAt)] });
  res.json(reductions);
});

app.post('/api/admin/reductions', authenticateToken, async (req, res) => {
  const data = req.body;
  const id = \`fr_\${uuidv4().substring(0,8)}\`;
  await db.insert(schema.fullReductions).values({ ...data, id });
  res.json({ success: true, id });
});`;

code = code.replace("// Vite Setup", getReductions + "\n\n// Vite Setup");
fs.writeFileSync('server.ts', code);
