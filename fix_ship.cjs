const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const shipQuery = `app.post('/api/admin/orders/:id/ship', authenticateToken, async (req, res) => {
  await db.update(schema.orders).set({ status: 'shipped', remark: req.body.trackingNo }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});`;

code = code.replace(/app\.post\('\/api\/admin\/orders\/:id\/ship', authenticateToken, async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true \}\);\n\}\);/, shipQuery);

// Stats API enhancement
const statsQuery = `app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  const list = await db.query.orders.findMany();
  let todaySalesTotal = 0;
  let todayOrdersCount = 0;
  let pendingShipmentCount = 0;
  
  for (const order of list) {
    if (order.status === 'paid') pendingShipmentCount++;
    if (order.status === 'paid' || order.status === 'shipped' || order.status === 'completed') {
      todaySalesTotal += order.grandTotalCents;
      todayOrdersCount++;
    }
  }
  
  res.json({
    todaySalesTotal: todaySalesTotal / 100, // Frontend might expect dollars or cents, we'll see
    todayOrdersCount,
    pendingShipmentCount,
    pendingRefundCount: 0
  });
});`;

code = code.replace(/app\.get\('\/api\/admin\/stats', authenticateToken, async \(req, res\) => \{[\s\S]*?\}\);/, statsQuery);

fs.writeFileSync('server.ts', code);
