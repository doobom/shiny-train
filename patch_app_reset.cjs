const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import UserProfile from './components/shop/UserProfile';", "import UserProfile from './components/shop/UserProfile';\nimport PasswordReset from './components/shop/PasswordReset';");

const mainContent = `      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {window.location.pathname === '/password/reset' ? (
          <PasswordReset />
        ) : !tokenReady && (isAdminMode || !['shop_home', 'product_detail', 'cart'].includes(currentView)) ? (`;

code = code.replace(`      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {!tokenReady && (isAdminMode || !['shop_home', 'product_detail', 'cart'].includes(currentView)) ? (`, mainContent);

fs.writeFileSync('src/App.tsx', code);
