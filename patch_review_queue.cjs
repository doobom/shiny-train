const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const reviewQueueApi = `
app.get('/api/admin/payments/review-queue', authenticateAdmin, requirePermission('orders'), async (req, res) => {
  const pendingOrders = await db.query.orders.findMany({
    where: eq(schema.orders.status, 'pending_review'),
    orderBy: [desc(schema.orders.createdAt)],
    with: { user: true }
  });
  // Decrypt sensitive
  pendingOrders.forEach((o: any) => {
    o.addressPhone = decrypt(o.addressPhone);
    o.addressDetail = decrypt(o.addressDetail);
    if (o.user) o.user.phoneEncrypted = decrypt(o.user.phoneEncrypted);
  });
  res.json({ success: true, queue: pendingOrders });
});
`;

if (!code.includes('review-queue')) {
  code = code.replace(
    /app\.post\('\/api\/admin\/orders\/:id\/approve-payment'/,
    reviewQueueApi + "\napp.post('/api/admin/orders/:id/approve-payment'"
  );
  fs.writeFileSync('server.ts', code);
}
