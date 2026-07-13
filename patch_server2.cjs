const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `app.post('/api/cart/items', authenticateToken, async (req, res) => { console.log('POST /api/cart/items body:', req.body, 'headers:', req.headers);\n  const { skuId, qty } = req.body;`,
  `app.post('/api/cart/items', authenticateToken, async (req, res) => { console.log('POST /api/cart/items body:', req.body, 'headers:', req.headers);\n  const { skuId, qty } = req.body;\n  if (!skuId || qty == null) return res.status(400).json({ success: false, message: 'Missing skuId or qty' });`
);

// Fallback in case the console.log patch wasn't applied correctly
code = code.replace(
  `app.post('/api/cart/items', authenticateToken, async (req, res) => { console.log('POST /api/cart/items body:', req.body);\n  const { skuId, qty } = req.body;`,
  `app.post('/api/cart/items', authenticateToken, async (req, res) => { console.log('POST /api/cart/items body:', req.body);\n  const { skuId, qty } = req.body;\n  if (!skuId || qty == null) return res.status(400).json({ success: false, message: 'Missing skuId or qty' });`
);

fs.writeFileSync('server.ts', code);
