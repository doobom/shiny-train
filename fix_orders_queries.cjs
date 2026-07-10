const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const userOrdersQuery = `app.get('/api/orders/mine/:userId', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const list = await db.query.orders.findMany({ where: eq(schema.orders.userId, userId), orderBy: [desc(schema.orders.createdAt)] });
  
  const formatted = [];
  for (const order of list) {
    const items = await db.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, order.id) });
    const formattedItems = [];
    for (const item of items) {
      const spec = await db.query.productSpecs.findFirst({ where: eq(schema.productSpecs.id, item.skuId) });
      const product = spec ? await db.query.products.findFirst({ where: eq(schema.products.id, spec.productId) }) : null;
      
      formattedItems.push({
        id: item.id,
        qty: item.qty,
        productSnapshot: {
          imageUrl: product?.images?.[0] || '',
          nameZh: product?.nameZh || '',
          nameEn: product?.nameEn || '',
          specNameZh: spec?.specNameZh || '',
          specNameEn: spec?.specNameEn || ''
        }
      });
    }
    
    formatted.push({
      id: order.id,
      orderNo: order.id,
      totalCents: order.grandTotalCents,
      status: order.status,
      items: formattedItems
    });
  }
  
  res.json(formatted);
});`;

code = code.replace(/app\.get\('\/api\/orders\/mine\/:userId', authenticateToken, async \(req, res\) => \{[\s\S]*?res\.json\(list\);\n\}\);/, userOrdersQuery);


const adminOrdersQuery = `app.get('/api/admin/orders', authenticateToken, async (req, res) => {
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
      paymentStatus: order.status === 'pending_payment' ? 'pending' : 'paid',
      shippingMethod: 'Standard',
      trackingNo: order.remark || '',
      createdAt: order.createdAt
    });
  }
  
  res.json(formatted);
});`;

code = code.replace(/app\.get\('\/api\/admin\/orders', authenticateToken, async \(req, res\) => \{[\s\S]*?res\.json\(list\);\n\}\);/, adminOrdersQuery);

fs.writeFileSync('server.ts', code);
