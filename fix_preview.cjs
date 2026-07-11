const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injection = `
  const invs = specs.length ? await db.query.inventory.findMany({
    where: inArray(schema.inventory.skuId, specs.map((s: any) => s.id))
  }) : [];
  
  for (const item of items) {
    const inv = invs.find((i: any) => i.skuId === item.skuId);
    if (!inv) return res.status(400).json({ error: 'Inventory not found for SKU: ' + item.skuId });
    if (item.qty > inv.stock - inv.lockedStock) {
       return res.status(400).json({ error: 'Insufficient stock for SKU: ' + item.skuId });
    }
  }

  for (const item of items) {`;

code = code.replace('  for (const item of items) {', injection);
fs.writeFileSync('server.ts', code);
console.log("Preview limit logic updated.");
