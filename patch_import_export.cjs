const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/admin/orders', authenticateAdmin, requirePermission('manage_orders'), async (req, res) => {`;
const replace = `
app.get('/api/admin/orders/export', authenticateAdmin, requirePermission('manage_orders'), async (req, res) => {
  const allOrders = await db.query.orders.findMany({
    with: { user: true }
  });
  
  let csv = 'Order ID,Date,Status,User Email,Grand Total (Cents),Payment Method\\n';
  allOrders.forEach((o: any) => {
    const email = o.user ? o.user.email : 'Unknown';
    csv += \`\${o.id},\${o.createdAt},\${o.status},\${email},\${o.grandTotalCents},\${o.paymentMethod}\\n\`;
  });
  
  res.header('Content-Type', 'text/csv');
  res.attachment('orders_export.csv');
  res.send(csv);
});

app.post('/api/admin/products/import', authenticateAdmin, requirePermission('manage_products'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ code: 'NO_FILE' });
  const content = req.file.buffer.toString('utf8');
  const lines = content.split('\\n');
  
  // Very simple CSV parser: skip header
  let imported = 0;
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length >= 4) {
      const nameZh = parts[0];
      const nameEn = parts[1];
      const priceOrig = parseInt(parts[2]);
      const priceAfter = parseInt(parts[3]);
      
      const pId = \`prod_\${require('uuid').v4().substring(0,8)}\`;
      await db.insert(schema.products).values({
        id: pId,
        nameZh, nameEn, priceOriginalCents: priceOrig, priceAfterCents: priceAfter,
        status: 'on_shelf'
      });
      imported++;
    }
  }
  res.json({ success: true, imported });
});

app.get('/api/admin/orders', authenticateAdmin, requirePermission('manage_orders'), async (req, res) => {`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
