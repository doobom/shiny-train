const fs = require('fs');

// Fix App.tsx missing cartBounce state
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
if (!appCode.includes('cartBounce')) {
  appCode = appCode.replace(
    `const [cartCount, setCartCount] = useState<number>(0);`,
    `const [cartCount, setCartCount] = useState<number>(0);\n  const [cartBounce, setCartBounce] = useState(false);`
  );
  fs.writeFileSync('src/App.tsx', appCode);
}
