const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  `app.post('/api/cart/items', authenticateToken, async (req, res) => { console.log('POST /api/cart/items body:', req.body);`,
  `app.post('/api/cart/items', authenticateToken, async (req, res) => { console.log('POST /api/cart/items body:', req.body, 'headers:', req.headers);`
);

fs.writeFileSync('server.ts', code);
