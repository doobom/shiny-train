const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const { items } = req.body;
  
  // Enforce D20 limits
  let totalQty = items.reduce((sum:any, i:any) => sum + i.qty, 0);
  const maxPerItem = 5;
  const maxTotal = 20;
  
  if (totalQty > maxTotal) {
    return res.status(400).json({ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum total items per order (' + maxTotal + ')' });
  }
  for (const item of items) {
    if (item.qty > maxPerItem) {
      return res.status(400).json({ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum quantity for a single item (' + maxPerItem + ')' });
    }
  }

  let subtotalCents = 0;
  let itemDetails = [];
  
  const specs = items.length ? await db.query.productSpecs.findMany({`;

const replace = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const { items } = req.body;
  let subtotalCents = 0;
  let itemDetails = [];
  
  const specs = items.length ? await db.query.productSpecs.findMany({`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
