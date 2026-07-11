const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /app\.get\('\/api\/admin\/orders', authenticateAdmin, async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true, orders: list \}\);\n  \} catch \(error\)/,
  `app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const list = await db.query.orders.findMany({
      orderBy: [desc(schema.orders.createdAt)],
      with: { items: { with: { sku: { with: { product: true } } } }, user: true }
    });
    list.forEach(o => {
      o.addressPhone = decrypt(o.addressPhone);
      o.addressDetail = decrypt(o.addressDetail);
      if (o.user) o.user.phoneEncrypted = decrypt(o.user.phoneEncrypted);
    });
    res.json({ success: true, orders: list });
  } catch (error)`
);

fs.writeFileSync('server.ts', code);
