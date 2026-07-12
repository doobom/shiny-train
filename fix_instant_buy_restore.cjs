const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ProductDetail.tsx', 'utf8');

const target1 = `  const handleInstantBuy = () => {
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }

    if (!userId) {
      // Local Cart
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const existing = localCart.find((i: any) => i.skuId === selectedSpec.id);
      if (existing) {
        existing.qty += quantity;
        existing.checked = true; // ensure it's checked
      } else {
        localCart.push({
          skuId: selectedSpec.id,
          qty: quantity,
          addedAt: new Date().toISOString(),
          checked: true
        });
      }
      localStorage.setItem('localCart', JSON.stringify(localCart));
      // redirect to cart so they can hit checkout
      onAddToCart(); 
      return;
    }`;

const replace1 = `  const handleInstantBuy = () => {
    if (quantity > 5) {
      setErr(dict.limitExceeded);
      return;
    }
    onInstantBuy(selectedSpec.id, quantity);
  `; // wait, I just replaced the entire block. I should ensure I don't break the syntax.

code = code.replace(target1, replace1);
fs.writeFileSync('src/components/shop/ProductDetail.tsx', code);
