const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ProductDetail.tsx', 'utf-8');

code = code.replace(
  ".then(data => {",
  ".then(data => {\n        if (Array.isArray(data)) return;"
);

fs.writeFileSync('src/components/shop/ProductDetail.tsx', code);
