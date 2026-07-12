const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `    if (user.role === 'admin' && appMode !== 'user') {
      setIsAdminMode(true);
    }
  };`;

const replace1 = `    if (user.role === 'admin' && appMode !== 'user') {
      setIsAdminMode(true);
    }
    
    // Merge local cart
    const localCart = JSON.parse(localStorage.getItem('localCart') || '[]');
    if (localCart.length > 0) {
      fetch('/api/cart/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
        body: JSON.stringify({ userId: user.id, localItems: localCart })
      })
      .then(() => {
        localStorage.removeItem('localCart');
        fetchCartCount(user.id);
      })
      .catch(console.error);
    }
  };`;

code = code.replace(target1, replace1);
fs.writeFileSync('src/App.tsx', code);
