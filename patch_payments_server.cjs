const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const webhookCode = `
app.post('/api/payments/webhook/:method', async (req, res) => {
  const method = req.params.method; // e.g. stripe
  // In a real scenario, you'd verify webhook signatures here.
  // For now, we mock the payload parsing
  const { orderId, status, amount } = req.body;
  if (!orderId || status !== 'success') return res.status(400).json({ error: 'Invalid payload' });

  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, orderId) });
  if (!order || order.status !== 'pending_payment') return res.status(400).json({ error: 'Invalid order' });

  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status: 'paid', paymentMethod: method }).where(eq(schema.orders.id, orderId));
    await tx.insert(schema.payments).values({
      id: \`pay_\${uuidv4().substring(0,8)}\`,
      orderId,
      method,
      amountCents: order.grandTotalCents,
      status: 'success'
    });
  });

  const user = await db.query.users.findFirst({ where: eq(schema.users.id, order.userId) });
  sendTransactionalEmail(user?.email || 'admin@example.com', 'Payment Successful: ' + orderId, 'Your payment has been processed successfully.');
  
  res.json({ received: true });
});

app.post('/api/payments/:orderId/charge', authenticateToken, async (req, res) => {
  // Simulate creating a payment intent and returning clientSecret
  // Webhook will handle actual status update in a real flow. 
  // For demo, we just return the mock secret. The frontend will pretend it succeeded and call webhook or we can just let frontend assume it paid.
  res.json({ success: true, clientSecret: 'mock_secret_xyz' });
});

app.post('/api/payments/:orderId/voucher', authenticateToken, async (req, res) => {
  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status: 'pending_review', paymentMethod: 'bank_transfer' }).where(eq(schema.orders.id, req.params.orderId));
    await tx.insert(schema.payments).values({
      id: \`pay_\${uuidv4().substring(0,8)}\`,
      orderId: req.params.orderId,
      method: 'bank_transfer',
      amountCents: 0, // not verified yet
      status: 'pending'
    });
  });
  res.json({ success: true });
});
`;

code = code.replace(
  /app\.post\('\/api\/payments\/:orderId\/charge', async \(req, res\) => \{[\s\S]*?res\.json\(\{ success: true \}\);\n\}\);/g,
  webhookCode
);

fs.writeFileSync('server.ts', code);
