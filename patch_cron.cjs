const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const cronLogic = `
// Cron Jobs
setInterval(async () => {
  try {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
    const expiredOrders = await db.query.orders.findMany({
      where: and(
        eq(schema.orders.status, 'pending_payment'),
        sql\`created_at < \${thirtyMinsAgo}\`
      ),
      with: { items: true }
    });
    
    for (const order of expiredOrders) {
      await db.transaction(async (tx) => {
        await tx.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, order.id));
        for (const item of order.items) {
          await tx.execute(
            sql\`UPDATE \${schema.inventory} SET locked_stock = GREATEST(0, locked_stock - \${item.qty}) WHERE sku_id = \${item.skuId}\`
          );
        }
      });
      console.log(\`[Cron] Cancelled order \${order.id} due to timeout\`);
    }
    
    // Clean old carts (7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oldCarts = await db.query.carts.findMany({
      where: sql\`updated_at < \${sevenDaysAgo}\`
    });
    for (const cart of oldCarts) {
      await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));
    }
  } catch (err) {
    console.error('[Cron] Error running jobs', err);
  }
}, 60 * 1000);
`;

if (!code.includes('// Cron Jobs')) {
  code = code.replace(
    /app\.listen\(PORT, '0\.0\.0\.0'/,
    cronLogic + '\n  app.listen(PORT, \'0.0.0.0\''
  );
  fs.writeFileSync('server.ts', code);
}
