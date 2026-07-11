const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /app\.post\('\/api\/admin\/products', authenticateAdmin, /g,
  "app.post('/api/admin/products', authenticateAdmin, requirePermission('products'), "
);
code = code.replace(
  /app\.get\('\/api\/admin\/products', authenticateAdmin, /g,
  "app.get('/api/admin/products', authenticateAdmin, requirePermission('products'), "
);
code = code.replace(
  /app\.get\('\/api\/admin\/orders', authenticateAdmin, /g,
  "app.get('/api/admin/orders', authenticateAdmin, requirePermission('orders'), "
);
code = code.replace(
  /app\.post\('\/api\/admin\/orders\/:id\/ship', authenticateAdmin, /g,
  "app.post('/api/admin/orders/:id/ship', authenticateAdmin, requirePermission('orders'), "
);
code = code.replace(
  /app\.post\('\/api\/admin\/orders\/:id\/close', authenticateAdmin, /g,
  "app.post('/api/admin/orders/:id/close', authenticateAdmin, requirePermission('orders'), "
);
code = code.replace(
  /app\.get\('\/api\/admin\/users', authenticateAdmin, /g,
  "app.get('/api/admin/users', authenticateAdmin, requirePermission('users'), "
);
code = code.replace(
  /app\.post\('\/api\/admin\/users\/invite', authenticateAdmin, /g,
  "app.post('/api/admin/users/invite', authenticateAdmin, requirePermission('users'), "
);
code = code.replace(
  /app\.patch\('\/api\/admin\/users\/:id\/role', authenticateAdmin, /g,
  "app.patch('/api/admin/users/:id/role', authenticateAdmin, requirePermission('users'), "
);
code = code.replace(
  /app\.patch\('\/api\/admin\/users\/:id\/tier', authenticateAdmin, /g,
  "app.patch('/api/admin/users/:id/tier', authenticateAdmin, requirePermission('users'), "
);
code = code.replace(
  /app\.patch\('\/api\/admin\/users\/:id\/permissions', authenticateAdmin, /g,
  "app.patch('/api/admin/users/:id/permissions', authenticateAdmin, requirePermission('users'), "
);

fs.writeFileSync('server.ts', code);
