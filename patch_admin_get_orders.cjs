const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const updatedOrdersGet = `
app.get('/api/admin/orders', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const list = await db.query.orders.findMany({ orderBy: [desc(schema.orders.createdAt)] });
  
  const formatted = [];
  for (const order of list) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    formatted.push({
      id: order.id,
      orderNo: order.id,
      userEmail: user?.email || 'Unknown',
      totalCents: order.grandTotalCents,
      status: order.status,
      paymentStatus: order.status === 'pending_review' ? 'pending_review' : (order.status === 'pending_payment' ? 'pending' : 'paid'),
      shippingMethod: order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Standard',
      trackingNo: order.remark || '',
      createdAt: order.createdAt
    });
  }
  res.json(formatted);
});
`;

code = code.replace(
  /app\.get\('\/api\/admin\/orders', authenticateAdmin, requirePermission\('orders'\), async \(req, res\) => \{[\s\S]*?res\.json\(formatted\);\n\}\);/,
  updatedOrdersGet
);

fs.writeFileSync('server.ts', code);
