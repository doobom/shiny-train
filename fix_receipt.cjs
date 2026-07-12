const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/orders/:id', authenticateToken, async (req, res) => {`;

const replace = `app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const orderId = req.params.id;
  
  const order = await db.query.orders.findFirst({
    where: and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId))
  });
  
  if (!order) return res.status(404).json({ code: 'NOT_FOUND' });
  
  const items = await db.query.orderItems.findMany({
    where: eq(schema.orderItems.orderId, orderId)
  });
  
  // Return a clean snapshot for client-side receipt rendering
  res.json({
    success: true,
    receipt: {
      orderNo: order.id,
      date: order.createdAt,
      status: order.status,
      customerName: order.addressRecipient,
      customerPhone: order.addressPhone,
      shippingAddress: order.addressDetail,
      paymentMethod: order.paymentMethod,
      items: items.map(i => ({
        skuId: i.skuId,
        qty: i.qty,
        unitPrice: i.priceCents
      })),
      subtotal: order.totalCents,
      shippingFee: order.shippingFeeCents,
      discount: order.discountCents,
      grandTotal: order.grandTotalCents,
      company: "香港生活百貨 (HK Life Store)",
      taxId: "BRN-12345678"
    }
  });
});

app.get('/api/orders/:id', authenticateToken, async (req, res) => {`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
