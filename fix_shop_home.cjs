const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ShopHome.tsx', 'utf-8');

code = code.replace(
  ".then(data => setProducts(data))",
  ".then(data => setProducts(Array.isArray(data) ? data : data.data || []))"
);

fs.writeFileSync('src/components/shop/ShopHome.tsx', code);
