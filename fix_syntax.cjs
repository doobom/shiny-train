const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ProductDetail.tsx', 'utf8');

const target = `  const handleInstantBuy = () => {
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }
    onInstantBuy(selectedSpec.id, quantity);
  
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }
    onInstantBuy(selectedSpec.id, quantity);
  };`;

const replace = `  const handleInstantBuy = () => {
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }
    onInstantBuy(selectedSpec.id, quantity);
  };`;

code = code.replace(target, replace);
fs.writeFileSync('src/components/shop/ProductDetail.tsx', code);
