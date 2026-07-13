const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('cartBounce')) {
  code = code.replace(
    'const [cartCount, setCartCount] = useState(0);',
    'const [cartCount, setCartCount] = useState(0);\n  const [cartBounce, setCartBounce] = useState(false);'
  );

  code = code.replace(
    'onAddToCart={() => {\n                  fetchCartCount();\n                }}',
    'onAddToCart={() => {\n                  fetchCartCount();\n                  setCartBounce(true);\n                  setTimeout(() => setCartBounce(false), 300);\n                }}'
  );

  code = code.replace(
    '<span className="absolute -top-1 -right-1 bg-amber-500 text-black font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white font-mono shadow-sm">',
    '<span className={`absolute -top-1 -right-1 bg-amber-500 text-black font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white font-mono shadow-sm transition-transform duration-300 ${cartBounce ? "scale-150" : "scale-100"}`}>'
  );

  fs.writeFileSync('src/App.tsx', code);
}
