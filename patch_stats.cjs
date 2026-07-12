const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  for (const inv of inventory) {
    if (inv.stock <= inv.warnThreshold) stockAlerts++;
  }`;

const replaceStr = `  for (const inv of inventory) {
    if (inv.stock <= inv.warnThreshold) stockAlerts++;
  }

  // Generate sales history for the last 7 days
  const salesHistory = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    let dailySales = 0;
    let dailyOrders = 0;
    
    for (const order of orders) {
      if (!order.createdAt) continue;
      const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
      if (orderDateStr === dateStr && (order.status === 'paid' || order.status === 'shipped' || order.status === 'completed')) {
        dailySales += Number(order.grandTotalCents);
        dailyOrders++;
      }
    }
    
    salesHistory.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: dailySales / 100,
      orders: dailyOrders
    });
  }`;

code = code.replace(targetStr, replaceStr);

const resultTarget = `  res.json({
    totalSalesCents,
    totalOrdersCount,
    productsCount,
    stockAlerts,
    pendingOrders,
    paidOrders,
    shippedOrders
  });`;

const resultReplace = `  res.json({
    totalSalesCents,
    totalOrdersCount,
    productsCount,
    stockAlerts,
    pendingOrders,
    paidOrders,
    shippedOrders,
    salesHistory
  });`;

code = code.replace(resultTarget, resultReplace);

fs.writeFileSync('server.ts', code);
