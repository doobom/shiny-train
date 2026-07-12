const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import AdminUsers from './components/admin/AdminUsers';", "import AdminUsers from './components/admin/AdminUsers';\nimport AdminCMS from './components/admin/AdminCMS';");

const targetTab = `{ id: 'marketing', label: locale === 'zh-HK' ? '營銷與折扣' : 'Marketing' },`;
const replaceTab = `{ id: 'marketing', label: locale === 'zh-HK' ? '營銷與折扣' : 'Marketing' },
                  { id: 'cms', label: locale === 'zh-HK' ? '內容管理' : 'CMS' },`;

code = code.replace(targetTab, replaceTab);

const targetRoute = `{activeAdminTab === 'marketing' && <AdminMarketing locale={locale} />}`;
const replaceRoute = `{activeAdminTab === 'marketing' && <AdminMarketing locale={locale} />}
              {activeAdminTab === 'cms' && <AdminCMS locale={locale} />}`;

code = code.replace(targetRoute, replaceRoute);

fs.writeFileSync('src/App.tsx', code);
