const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/orders/:id/receipt', authenticateToken, async (req, res) => {
  const orderId = req.params.id;
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order) return res.status(404).send('Order not found');
  
  const html = \`
    <html>
      <head><title>Receipt \${order.id}</title></head>
      <body style="font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #333;">Receipt</h1>
        <div style="text-align: left; max-width: 400px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
          <p><strong>Order ID:</strong> \${order.id}</p>
          <p><strong>Date:</strong> \${new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Total:</strong> HK$ \${(order.totalCents / 100).toFixed(2)}</p>
          <p><strong>Status:</strong> \${order.status}</p>
        </div>
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; cursor: pointer;">Print Receipt</button>
      </body>
    </html>
  \`;
  res.send(html);
});`;

code = code.replace(target, '');
fs.writeFileSync('server.ts', code);
