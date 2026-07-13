const fs = require('fs');

// Fix server.ts duplicate import
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace("import rateLimit from 'express-rate-limit';\nconst globalLimiter", "const globalLimiter");
fs.writeFileSync('server.ts', serverCode);

// Fix App.tsx missing cartBounce state
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('cartBounce')) {
  appCode = appCode.replace(
    `const [cartCount, setCartCount] = useState(0);`,
    `const [cartCount, setCartCount] = useState(0);\n  const [cartBounce, setCartBounce] = useState(false);`
  );
  fs.writeFileSync('src/App.tsx', appCode);
}

