const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I will insert it after app.get('/api/favorites', ...
const target = `app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const list = await db.query.favorites.findMany({ where: eq(schema.favorites.userId, userId) });
  res.json(list);
});`;

const replace = `app.get('/api/favorites', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const list = await db.query.favorites.findMany({ where: eq(schema.favorites.userId, userId) });
  res.json(list);
});

app.post('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const productId = req.params.productId;
  const existing = await db.query.favorites.findFirst({ where: and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, productId)) });
  if (!existing) {
    await db.insert(schema.favorites).values({ id: 'fav_' + require('uuid').v4().substring(0, 8), userId, productId });
  }
  res.json({ success: true });
});

app.delete('/api/favorites/:productId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  await db.delete(schema.favorites).where(and(eq(schema.favorites.userId, userId), eq(schema.favorites.productId, req.params.productId)));
  res.json({ success: true });
});`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
