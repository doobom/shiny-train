const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `                onInstantBuy={(skuId, qty) => {
                  apiFetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, skuId, qty })
                  })
                  .then(res => res.json())
                  .then(() => {
                    fetchCartCount();
                    setCurrentView('checkout');
                  })
                  .catch(e => console.error(e));
                }}`;

const replace1 = `                onInstantBuy={(skuId, qty) => {
                  if (!userId) {
                    const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
                    const existing = localCart.find((i: any) => i.skuId === skuId);
                    if (existing) {
                      existing.qty += qty;
                      existing.checked = true;
                    } else {
                      localCart.push({ skuId, qty, addedAt: new Date().toISOString(), checked: true });
                    }
                    localStorage.setItem('localCart', JSON.stringify(localCart));
                    fetchCartCount();
                    setCurrentView('checkout');
                    return;
                  }
                  
                  apiFetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, skuId, qty })
                  })
                  .then(res => res.json())
                  .then(() => {
                    fetchCartCount();
                    setCurrentView('checkout');
                  })
                  .catch(e => console.error(e));
                }}`;

code = code.replace(target1, replace1);
fs.writeFileSync('src/App.tsx', code);
