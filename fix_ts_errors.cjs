const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Fix rowCount
code = code.replace(
  /if \(res\.length === 0\) \{/g,
  "if (res.rowCount === 0) {"
);

// Fix cron order items fetch
const oldCron = `    const expiredOrders = await db.query.orders.findMany({
      where: and(
        eq(schema.orders.status, 'pending_payment'),
        sql\\\`created_at < \\\${thirtyMinsAgo}\\\`
      ),
      with: { items: true }
    });
    
    for (const order of expiredOrders) {
      await db.transaction(async (tx) => {
        await tx.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, order.id));
        for (const item of order.items) {`;

const newCron = `    const expiredOrders = await db.query.orders.findMany({
      where: and(
        eq(schema.orders.status, 'pending_payment'),
        sql\`created_at < \${thirtyMinsAgo}\`
      )
    });
    
    for (const order of expiredOrders) {
      await db.transaction(async (tx) => {
        await tx.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, order.id));
        const orderItems = await tx.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, order.id) });
        for (const item of orderItems) {`;

code = code.replace(
  /const expiredOrders = await db\.query\.orders\.findMany\(\{[\s\S]*?for \(const item of order\.items\) \{/m,
  newCron
);

fs.writeFileSync('server.ts', code);
