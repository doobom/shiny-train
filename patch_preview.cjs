const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetStr = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const { items } = req.body;
  let subtotalCents = 0;`;

const replaceStr = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const items = req.body.items || [];
  let subtotalCents = 0;`;

code = code.replace(targetStr, replaceStr);

const targetStr2 = `app.post('/api/orders', authenticateToken, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  const { items, address, paymentMethod, remark } = req.body;`;

const replaceStr2 = `app.post('/api/orders', authenticateToken, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  const { address, paymentMethod, remark } = req.body;
  const items = req.body.items || [];`;

code = code.replace(targetStr2, replaceStr2);

fs.writeFileSync('server.ts', code);
