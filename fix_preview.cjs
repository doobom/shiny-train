const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const correctPreview = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const { items } = req.body;
  let subtotalCents = 0;
  let itemDetails = [];
  
  const specs = items.length ? await db.query.productSpecs.findMany({
    where: inArray(schema.productSpecs.id, items.map((i: any) => i.skuId))
  }) : [];
  
  const prods = specs.length ? await db.query.products.findMany({
    where: inArray(schema.products.id, specs.map((s: any) => s.productId))
  }) : [];
  
  for (const item of items) {
    const spec = specs.find((s: any) => s.id === item.skuId);
    const product = prods.find((p: any) => p.id === spec?.productId);
    
    if (spec && product) {
      subtotalCents += spec.priceAfterCents * item.qty;
      itemDetails.push({
        spec,
        product,
        qty: item.qty,
        unitPriceCents: spec.priceAfterCents
      });
    }
  }
  
  let shippingFeeCents = subtotalCents >= 30000 ? 0 : 3000; // Free shipping over HK$300, else HK$30
  let discountCents = 0; // Can add coupon logic here later
  let totalCents = subtotalCents + shippingFeeCents - discountCents;
  
  res.json({
    subtotalCents,
    shippingFeeCents,
    discountCents,
    totalCents,
    itemDetails
  });
});`;

code = code.replace(/app\.post\('\/api\/checkout\/preview', authenticateToken, async \(req, res\) => \{[\s\S]*?\}\);/, correctPreview);

fs.writeFileSync('server.ts', code);
