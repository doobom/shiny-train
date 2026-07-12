const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `!['shop_home', 'product_detail'].includes(currentView)`,
  `!['shop_home', 'product_detail', 'cart'].includes(currentView)`
);

const targetFetchCartCount = `  const fetchCartCount = () => {
    if (!tokenReady) return;`;
const replaceFetchCartCount = `  const fetchCartCount = () => {
    if (!tokenReady) {
      const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
      const total = localCart.reduce((sum: number, item: any) => sum + item.qty, 0);
      setCartCount(total);
      return;
    }`;
code = code.replace(targetFetchCartCount, replaceFetchCartCount);

// Also need to trigger fetchCartCount on load if not logged in
const targetUseEffect = `  useEffect(() => {
    if (tokenReady) {
      fetchCartCount();
    }
  }, [tokenReady, userId]);`;
const replaceUseEffect = `  useEffect(() => {
    fetchCartCount();
  }, [tokenReady, userId, currentView]);`;
code = code.replace(targetUseEffect, replaceUseEffect);

fs.writeFileSync('src/App.tsx', code);
