const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ProductDetail.tsx', 'utf-8');
code = code.replace(/if \(!userId\) \{\s+setErr\(dict\.authRequired\);\s+return;\s+\}/g, "if (!userId) {\n      onRequestLogin();\n      return;\n    }");
fs.writeFileSync('src/components/shop/ProductDetail.tsx', code);
