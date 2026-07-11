const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("id: 'users'")) {
  code = code.replace(
    /type AdminTab = 'dashboard' \| 'products' \| 'orders' \| 'marketing' \| 'feedback' \| 'settings';/,
    `type AdminTab = 'dashboard' | 'products' | 'orders' | 'marketing' | 'feedback' | 'settings' | 'users';`
  );
  
  code = code.replace(
    /\{ id: 'settings', label: locale === 'zh-HK' \? '參數與設定' : 'Settings & PITR' \}/,
    `{ id: 'settings', label: locale === 'zh-HK' ? '參數與設定' : 'Settings & PITR' },\n                  { id: 'users', label: locale === 'zh-HK' ? '用戶權限' : 'Users & Roles' }`
  );
  
  code = code.replace(
    /\{activeAdminTab === 'settings' && <AdminSettings locale=\{locale\} \/>\}/,
    `{activeAdminTab === 'settings' && <AdminSettings locale={locale} />}\n              {activeAdminTab === 'users' && <AdminUsers locale={locale} />}`
  );
  
  code = code.replace(
    /import AdminSettings from '.\/components\/admin\/AdminSettings.tsx';/,
    `import AdminSettings from './components/admin/AdminSettings.tsx';\nimport AdminUsers from './components/admin/AdminUsers.tsx';`
  );
  fs.writeFileSync('src/App.tsx', code);
}
