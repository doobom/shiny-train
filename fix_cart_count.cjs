const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `const fetchCartCount = () => {`,
  `const fetchCartCount = (uid?: string) => {`
);

code = code.replace(
  `apiFetch(\`/api/cart/\${userId}\`)`,
  `apiFetch(\`/api/cart/\${uid || userId}\`)`
);

fs.writeFileSync('src/App.tsx', code);
