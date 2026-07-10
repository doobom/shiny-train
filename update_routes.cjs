const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace standard route handlers to include middleware
code = code.replace(/app\.get\('\/api\/cart\/:userId', \(req, res\) => {\n  const { userId } = req\.params;/g, "app.get('/api/cart/:userId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");
code = code.replace(/app\.post\('\/api\/cart', \(req, res\) => {\n  const { userId, skuId, qty } = req\.body;/g, "app.post('/api/cart', authenticateToken, (req, res) => {\n  const { skuId, qty } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.put\('\/api\/cart\/items', \(req, res\) => {\n  const { userId, skuId, qty } = req\.body;/g, "app.put('/api/cart/items', authenticateToken, (req, res) => {\n  const { skuId, qty } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.delete\('\/api\/cart\/items', \(req, res\) => {\n  const { userId, skuId } = req\.body;/g, "app.delete('/api/cart/items', authenticateToken, (req, res) => {\n  const { skuId } = req.body;\n  const userId = (req as any).user.id;");

code = code.replace(/app\.post\('\/api\/checkout\/preview', \(req, res\) => {\n  const { userId, items } = req\.body;/g, "app.post('/api/checkout/preview', authenticateToken, (req, res) => {\n  const { items } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.post\('\/api\/orders', \(req, res\) => {\n  const { userId, items, address, paymentMethod, remark } = req\.body;/g, "app.post('/api/orders', authenticateToken, (req, res) => {\n  const { items, address, paymentMethod, remark } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.get\('\/api\/orders\/mine\/:userId', \(req, res\) => {\n  const { userId } = req\.params;/g, "app.get('/api/orders/mine/:userId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");

code = code.replace(/app\.post\('\/api\/feedbacks', \(req, res\) => {\n  const { userId, contact, type, orderId, content } = req\.body;/g, "app.post('/api/feedbacks', authenticateToken, (req, res) => {\n  const { contact, type, orderId, content } = req.body;\n  const userId = (req as any).user.id;");
code = code.replace(/app\.get\('\/api\/feedbacks\/mine\/:userId', \(req, res\) => {\n  const { userId } = req\.params;/g, "app.get('/api/feedbacks/mine/:userId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");

// Admin routes
code = code.replace(/app\.get\('\/api\/admin\/stats', \(req, res\) => {/g, "app.get('/api/admin/stats', authenticateToken, (req, res) => {");
code = code.replace(/app\.get\('\/api\/admin\/products', \(req, res\) => {/g, "app.get('/api/admin/products', authenticateToken, (req, res) => {");
code = code.replace(/app\.post\('\/api\/admin\/products', \(req, res\) => {/g, "app.post('/api/admin/products', authenticateToken, (req, res) => {");
code = code.replace(/app\.get\('\/api\/admin\/orders', \(req, res\) => {/g, "app.get('/api/admin/orders', authenticateToken, (req, res) => {");
code = code.replace(/app\.get\('\/api\/admin\/feedbacks', \(req, res\) => {/g, "app.get('/api/admin/feedbacks', authenticateToken, (req, res) => {");
code = code.replace(/app\.get\('\/api\/admin\/audit-logs', \(req, res\) => {/g, "app.get('/api/admin/audit-logs', authenticateToken, (req, res) => {");
code = code.replace(/app\.get\('\/api\/admin\/settings', \(req, res\) => {/g, "app.get('/api/admin/settings', authenticateToken, (req, res) => {");
code = code.replace(/app\.post\('\/api\/admin\/settings', \(req, res\) => {/g, "app.post('/api/admin/settings', authenticateToken, (req, res) => {");
code = code.replace(/app\.post\('\/api\/admin\/backups\/trigger', \(req, res\) => {/g, "app.post('/api/admin/backups/trigger', authenticateToken, (req, res) => {");


fs.writeFileSync('server.ts', code);
