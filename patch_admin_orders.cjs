const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
app.patch('/api/admin/orders/:id/price', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const adminId = (req as any).user.id;
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ grandTotalCents: req.body.grandTotalCents }).where(eq(schema.orders.id, req.params.id));
    await tx.insert(schema.auditLogs).values({
      id: \`aud_\${uuidv4().substring(0,8)}\`,
      adminId,
      action: \`Modified price of order \${req.params.id} from \${order.grandTotalCents} to \${req.body.grandTotalCents}\`,
      resource: 'orders'
    });
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/close', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'cancelled' }).where(eq(schema.orders.id, req.params.id));
    
    // Release inventory locks
    const orderItemsList = await tx.query.orderItems.findMany({ where: eq(schema.orderItems.orderId, req.params.id) });
    for (const item of orderItemsList) {
      await tx.execute(
        sql\`UPDATE \${schema.inventory} SET locked_stock = GREATEST(0, locked_stock - \${item.qty}) WHERE sku_id = \${item.skuId}\`
      );
    }
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/approve-payment', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.id));
    await tx.update(schema.payments).set({ status: 'success' }).where(eq(schema.payments.orderId, req.params.id));
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/reject-payment', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'pending_payment' }).where(eq(schema.orders.id, req.params.id));
    await tx.update(schema.payments).set({ status: 'failed' }).where(eq(schema.payments.orderId, req.params.id));
  });
  res.json({ success: true });
});

app.post('/api/admin/orders/:id/remark', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.update(schema.orders).set({ remark: req.body.remark }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});
`;

code = code.replace(
  /app\.patch\('\/api\/admin\/orders\/:id\/price', authenticateAdmin, async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true \}\);\n\}\);/g,
  ""
);

code = code.replace(
  /app\.post\('\/api\/admin\/orders\/:id\/close', authenticateAdmin, requirePermission\('orders'\), async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true \}\);\n\}\);/g,
  newEndpoints
);

fs.writeFileSync('server.ts', code);
