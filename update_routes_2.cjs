const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/app\.post\('\/api\/cart\/items', \(req, res\) => {\n  const { userId, skuId, qty } = req\.body;/g, "app.post('/api/cart/items', authenticateToken, (req, res) => {\n  const { skuId, qty } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.patch\('\/api\/cart\/items\/:itemId', \(req, res\) => {\n  const { qty } = req\.body;/g, "app.patch('/api/cart/items/:itemId', authenticateToken, (req, res) => {\n  const { qty } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.delete\('\/api\/cart\/items\/:itemId', \(req, res\) => {/g, "app.delete('/api/cart/items/:itemId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");

code = code.replace(/app\.post\('\/api\/checkout\/preview', \(req, res\) => {\n  const { userId, items } = req\.body;/g, "app.post('/api/checkout/preview', authenticateToken, (req, res) => {\n  const { items } = req.body;\n  const userId = (req as any).user.id;");

fs.writeFileSync('server.ts', code);
