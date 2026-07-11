const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  /\`\/api\/admin\/payments\/\$\{orderId\}\/approve\`/g,
  "\`/api/admin/orders/\${orderId}/approve-payment\`"
);
code = code.replace(
  /\`\/api\/admin\/payments\/\$\{orderId\}\/reject\`/g,
  "\`/api/admin/orders/\${orderId}/reject-payment\`"
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
