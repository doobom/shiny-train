const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Inject the seed import and route
if (!code.includes("import { seedDatabase }")) {
  code = code.replace("import * as schema from './src/server/schema.js';", "import * as schema from './src/server/schema.js';\nimport { seedDatabase } from './src/server/seed.js';");
  
  const seedRoute = `
app.post('/api/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded successfully.' });
  } catch (e: any) {
    res.status(500).json({ code: 'SEED_FAILED', message: e.message });
  }
});

// Setup auth interceptor context
`;
  code = code.replace("// Auth\n", seedRoute + "// Auth\n");
}

// Improve checkout preview logic to calculate shipping
const previewLogic = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const { items } = req.body;
  let totalCents = 0;
  
  const specs = items.length ? await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.id, items.map((i: any) => i.skuId))
  }) : [];
  
  for (const item of items) {
    const spec = specs.find((s: any) => s.id === item.skuId);
    if (spec) totalCents += spec.priceAfterCents * item.qty;
  }
  
  let shippingFeeCents = totalCents >= 30000 ? 0 : 3000; // Free shipping over HK$300, else HK$30
  let discountCents = 0; // Can add coupon logic here later
  
  res.json({
    totalCents,
    shippingFeeCents,
    discountCents,
    grandTotalCents: totalCents + shippingFeeCents - discountCents,
    availableCoupons: []
  });
});`;

code = code.replace(/app\.post\('\/api\/checkout\/preview', authenticateToken, async \(req, res\) => \{[\s\S]*?\}\);/, previewLogic);

// Add batch delete and select all cart features
const cartLogic = `app.post('/api/cart/batch', authenticateToken, async (req, res) => {
  const { action, itemIds, checked } = req.body;
  const userId = (req as any).user.id;
  
  if (action === 'delete') {
    if (itemIds && itemIds.length > 0) {
      await db.delete(schema.cartItems).where(inArray(schema.cartItems.id, itemIds));
    }
  } else if (action === 'check') {
    if (itemIds && itemIds.length > 0) {
      await db.update(schema.cartItems).set({ checked }).where(inArray(schema.cartItems.id, itemIds));
    }
  }
  res.json({ success: true });
});

// Checkout`;

code = code.replace("// Checkout", cartLogic);

fs.writeFileSync('server.ts', code);
