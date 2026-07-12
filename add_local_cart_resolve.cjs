const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetIdx = code.indexOf('// Apply migrations');

const apis = `
// ================= NEW CART LOCAL RESOLVE =================
app.post('/api/cart/local-resolve', async (req, res) => {
  const { localItems } = req.body;
  if (!localItems || !localItems.length) return res.json([]);
  
  const itemsWithDetails = [];
  for (let i = 0; i < localItems.length; i++) {
    const item = localItems[i];
    const spec = await db.query.productSpecs.findFirst({
      where: eq(schema.productSpecs.id, item.skuId)
    });
    if (spec) {
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, spec.productId)
      });
      itemsWithDetails.push({
        id: 'local_' + i,
        cartId: 'local',
        skuId: item.skuId,
        qty: item.qty,
        checked: item.checked !== false,
        spec,
        product
      });
    }
  }
  res.json(itemsWithDetails);
});
`;

const newCode = code.substring(0, targetIdx) + apis + code.substring(targetIdx);
fs.writeFileSync('server.ts', newCode);
