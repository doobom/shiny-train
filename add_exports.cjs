const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetIdx = code.indexOf('// Apply migrations');

const apis = `
// ================= NEW BATCH / EXPORT APIS =================

// B端：商品批量操作 - 批量导出 (CSV)
app.get('/api/admin/products/export', authenticateAdmin, requirePermission('products'), async (req, res) => {
  const prods = await db.query.products.findMany();
  let csv = 'ID,NameZh,NameEn,CategoryId,PriceOriginal,PriceAfter,Status\\n';
  for (const p of prods) {
    csv += \`"\${p.id}","\${p.nameZh}","\${p.nameEn}","\${p.categoryId}","\${p.priceOriginalCents}","\${p.priceAfterCents}","\${p.status}"\\n\`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment('products.csv');
  return res.send(csv);
});

// B端：订单数据导出 (CSV)
app.get('/api/admin/orders/export', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const { status, startDate, endDate } = req.query;
  const conditions = [];
  if (status) conditions.push(eq(schema.orders.status, status));
  if (startDate) conditions.push(gte(schema.orders.createdAt, new Date(startDate)));
  if (endDate) conditions.push(sql\`created_at <= \${new Date(endDate)}\`);
  
  const orderList = await db.query.orders.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { items: true }
  });
  
  let csv = 'OrderID,Status,UserId,TotalCents,CreatedAt,ItemsCount\\n';
  for (const o of orderList) {
    csv += \`"\${o.id}","\${o.status}","\${o.userId}","\${o.grandTotalCents}","\${o.createdAt}","\${o.items.length}"\\n\`;
  }
  res.header('Content-Type', 'text/csv');
  res.attachment('orders.csv');
  return res.send(csv);
});

// 电子收据 (SDRS §6.10)
app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const userId = req.user.id;
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
});

`;

const newCode = code.substring(0, targetIdx) + apis + code.substring(targetIdx);
fs.writeFileSync('server.ts', newCode);
