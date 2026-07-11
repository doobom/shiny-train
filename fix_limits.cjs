const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const injectionLimits = `
  // Platform D20 limit checks
  const settings = await db.query.platformSettings.findMany();
  const maxPerItem = parseInt(settings.find((s: any) => s.key === 'max_per_item')?.value || '999');
  const maxTotal = parseInt(settings.find((s: any) => s.key === 'max_total')?.value || '9999');
  
  if (totalQty > maxTotal) {
     return res.status(400).json({ error: 'Exceeded maximum total items per order (' + maxTotal + ')' });
  }
  for (const item of items) {
     if (item.qty > maxPerItem) {
        return res.status(400).json({ error: 'Exceeded maximum quantity for a single item (' + maxPerItem + ')' });
     }
  }
`;

// Inject into preview
code = code.replace(/for \(const item of items\) \{\n    const inv = invs/g, "let totalQty = items.reduce((sum:any, i:any) => sum + i.qty, 0);\n" + injectionLimits + "\n  for (const item of items) {\n    const inv = invs");

// Inject into orders
code = code.replace(/const orderItemsData = \[\];/g, "const orderItemsData: any[] = [];\n  let totalQty = items.reduce((sum:any, i:any) => sum + i.qty, 0);\n" + injectionLimits);

fs.writeFileSync('server.ts', code);
console.log("Limits injected");
