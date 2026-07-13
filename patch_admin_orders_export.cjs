const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');

code = code.replace(
  `Export CSV`,
  `{locale === 'zh-HK' ? '匯出報表' : 'Export CSV'}`
);

fs.writeFileSync('src/components/admin/AdminOrders.tsx', code);
