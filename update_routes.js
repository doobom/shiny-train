const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Replace standard route handlers to include middleware
// Example: app.get('/api/cart/:userId', (req, res) => {
// to: app.get('/api/cart/:userId', authenticateToken, (req, res) => {

code = code.replace(/app\.get\('\/api\/cart\/:userId', \(req, res\) => {/, "app.get('/api/cart/:userId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id; // Override param");
code = code.replace(/app\.post\('\/api\/cart', \(req, res\) => {/, "app.post('/api/cart', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");
code = code.replace(/app\.put\('\/api\/cart\/items', \(req, res\) => {/, "app.put('/api/cart/items', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");
code = code.replace(/app\.delete\('\/api\/cart\/items', \(req, res\) => {/, "app.delete('/api/cart/items', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");

code = code.replace(/app\.post\('\/api\/checkout\/preview', \(req, res\) => {/, "app.post('/api/checkout/preview', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");
code = code.replace(/app\.post\('\/api\/orders', \(req, res\) => {/, "app.post('/api/orders', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");
code = code.replace(/app\.get\('\/api\/orders\/mine\/:userId', \(req, res\) => {/, "app.get('/api/orders/mine/:userId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");

code = code.replace(/app\.post\('\/api\/feedbacks', \(req, res\) => {/, "app.post('/api/feedbacks', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");
code = code.replace(/app\.get\('\/api\/feedbacks\/mine\/:userId', \(req, res\) => {/, "app.get('/api/feedbacks/mine/:userId', authenticateToken, (req, res) => {\n  const userId = (req as any).user.id;");

// Fix instances where `const { userId } = req.body;` or `req.params;` is called right after my injection.
// I will just use regex to remove those lines, or I can just let it be and change it to avoid re-declaring.
