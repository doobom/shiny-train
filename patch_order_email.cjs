const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr1 = `app.post('/api/admin/orders/:id/ship', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.update(schema.orders).set({ status: 'shipped', remark: req.body.trackingNo }).where(eq(schema.orders.id, req.params.id));
  res.json({ success: true });
});`;

const replaceStr1 = `app.post('/api/admin/orders/:id/ship', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.update(schema.orders).set({ status: 'shipped', remark: req.body.trackingNo }).where(eq(schema.orders.id, req.params.id));
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
  if (order) {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    if (user && user.email) {
      emailQueue.push({
        to: user.email,
        subject: \`【香港生活百貨】您的訂單已發貨 (訂單號: \${order.id})\`,
        content: \`<p>您好，您的訂單 <b>\${order.id}</b> 已經發貨。</p><p>追蹤號碼: \${req.body.trackingNo || '無'}</p><p>感謝您的惠顧！</p>\`
      });
    }
  }
  res.json({ success: true });
});`;

code = code.replace(targetStr1, replaceStr1);

const targetStr2 = `app.post('/api/admin/orders/:id/approve-payment', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.id));
    await tx.update(schema.payments).set({ status: 'success' }).where(eq(schema.payments.orderId, req.params.id));
  });
  res.json({ success: true });
});`;

const replaceStr2 = `app.post('/api/admin/orders/:id/approve-payment', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({ where: eq(schema.orders.id, req.params.id) });
    if (!order) throw new Error('Order not found');
    await tx.update(schema.orders).set({ status: 'paid' }).where(eq(schema.orders.id, req.params.id));
    await tx.update(schema.payments).set({ status: 'success' }).where(eq(schema.payments.orderId, req.params.id));
    const user = await tx.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
    if (user && user.email) {
      emailQueue.push({
        to: user.email,
        subject: \`【香港生活百貨】付款成功 (訂單號: \${order.id})\`,
        content: \`<p>您好，您的訂單 <b>\${order.id}</b> 已經成功確認付款。</p><p>我們將盡快為您安排發貨！</p>\`
      });
    }
  });
  res.json({ success: true });
});`;

code = code.replace(targetStr2, replaceStr2);
fs.writeFileSync('server.ts', code);
