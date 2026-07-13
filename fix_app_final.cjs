const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
  "const [cartCount, setCartCount] = useState<number>(0);",
  "const [cartCount, setCartCount] = useState<number>(0);\n  const [cartBounce, setCartBounce] = useState<boolean>(false);"
);
fs.writeFileSync('src/App.tsx', code);

let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace(
  "import rateLimit from 'express-rate-limit';\n\nconst globalLimiter",
  "const globalLimiter"
);
serverCode = serverCode.replace(
  "import rateLimit from 'express-rate-limit';\nconst globalLimiter",
  "const globalLimiter"
);
fs.writeFileSync('server.ts', serverCode);
