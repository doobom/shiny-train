const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = `    if (user.role === 'admin' && appMode !== 'user') {
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

const replace = `    if (user.role === 'admin' && appMode !== 'user') {
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
        setTokenReady(true);
      })
      .catch(e => {
        console.error(e);
        setTokenReady(true);
      });
    } else {
      setTokenReady(true);
    }
  };`;

code = code.replace(target, replace);
code = code.replace(`setTokenReady(true);\n    \n    // Automatically switch to admin mode`, `// Automatically switch to admin mode`);

fs.writeFileSync('src/App.tsx', code);
