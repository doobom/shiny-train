const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const statsQuery = `app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  const orders = await db.query.orders.findMany();
  const products = await db.query.products.findMany();
  const inventory = await db.query.inventory.findMany();
  
  let totalSalesCents = 0;
  let totalOrdersCount = orders.length;
  let pendingOrders = 0;
  let paidOrders = 0;
  let shippedOrders = 0;
  let productsCount = products.length;
  let stockAlerts = 0;
  
  for (const order of orders) {
    if (order.status === 'pending_payment') pendingOrders++;
    if (order.status === 'paid') paidOrders++;
    if (order.status === 'shipped') shippedOrders++;
    if (order.status === 'paid' || order.status === 'shipped' || order.status === 'completed') {
      totalSalesCents += order.grandTotalCents;
    }
  }
  
  for (const inv of inventory) {
    if (inv.stock <= inv.warnThreshold) stockAlerts++;
  }
  
  res.json({
    totalSalesCents,
    totalOrdersCount,
    productsCount,
    stockAlerts,
    pendingOrders,
    paidOrders,
    shippedOrders
  });
});`;

code = code.replace(/app\.get\('\/api\/admin\/stats', authenticateToken, async \(req, res\) => \{[\s\S]*?\}\);/, statsQuery);

fs.writeFileSync('server.ts', code);
