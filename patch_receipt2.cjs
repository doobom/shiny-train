const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const order = await db.query.orders.findFirst({
    where: and(eq(schema.orders.id, req.params.id), eq(schema.orders.userId, userId)),
    with: { items: { with: { sku: { with: { product: true } } } } }
  });
  if (!order) return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found.' });
  if (order.status === 'pending_payment') return res.status(400).json({ code: 'NOT_PAID', message: 'Order not paid.' });
  
  let html = \`
    <html>
      <body style="font-family: sans-serif; padding: 20px;">
        <h2>Electronic Receipt</h2>
        <p><strong>Order ID:</strong> \${order.id}</p>
        <p><strong>Date:</strong> \${new Date(order.createdAt).toLocaleString()}</p>
        <hr />
        <ul>
  \`;
  for (const item of order.items) {
    html += \`<li>\${item.sku?.product?.nameEn || 'Item'} x\${item.qty} - HK$ \${((item.priceCents * item.qty) / 100).toFixed(2)}</li>\`;
  }
  html += \`
        </ul>
        <hr />
        <p><strong>Subtotal:</strong> HK$ \${(order.totalCents / 100).toFixed(2)}</p>
        <p><strong>Shipping:</strong> HK$ \${(order.shippingFeeCents / 100).toFixed(2)}</p>
        <p><strong>Discount:</strong> -HK$ \${(order.discountCents / 100).toFixed(2)}</p>
        <h3><strong>Total:</strong> HK$ \${(order.grandTotalCents / 100).toFixed(2)}</h3>
        <button onclick="window.print()" style="margin-top:20px;">Print</button>
      </body>
    </html>
  \`;
  res.send(html);
});`;

const replace = `app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const order = await db.query.orders.findFirst({
    where: and(eq(schema.orders.id, req.params.id), eq(schema.orders.userId, userId)),
    with: { items: { with: { sku: { with: { product: true } } } } }
  });
  if (!order) return res.status(404).json({ code: 'NOT_FOUND', message: 'Order not found.' });
  if (order.status === 'pending_payment') return res.status(400).json({ code: 'NOT_PAID', message: 'Order not paid.' });
  
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
  
  res.json({
    success: true,
    receipt: {
      company: 'Shiny Train HK',
      taxId: '88888888-000',
      orderNo: order.id,
      date: order.createdAt,
      customerName: user?.email || 'Customer',
      items: order.items.map(i => ({ skuId: i.sku?.product?.nameEn || i.skuId, qty: i.qty, unitPrice: i.priceCents })),
      subtotal: order.totalCents,
      shippingFee: order.shippingFeeCents,
      discount: order.discountCents,
      grandTotal: order.grandTotalCents
    }
  });
});`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
