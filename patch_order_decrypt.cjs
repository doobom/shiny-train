const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /app\.get\('\/api\/orders\/mine\/:userId', authenticateToken, async \(req, res\) => \{[\s\S]*?res\.json\(userOrders\);\n\}\);/,
  `app.get('/api/orders/mine/:userId', authenticateToken, async (req, res) => {
  if (req.params.userId !== (req as any).user.id) return res.status(403).json({ code: 'FORBIDDEN' });
  const userOrders = await db.query.orders.findMany({
    where: eq(schema.orders.userId, req.params.userId),
    orderBy: [desc(schema.orders.createdAt)],
    with: { items: { with: { sku: { with: { product: true } } } } }
  });
  userOrders.forEach(o => {
    o.addressPhone = decrypt(o.addressPhone);
    o.addressDetail = decrypt(o.addressDetail);
  });
  res.json(userOrders);
});`
);

fs.writeFileSync('server.ts', code);
