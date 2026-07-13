const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("adminConsole: '後台管理系統',", "adminConsole: '後台管理系統',\n      adminDrawer: '管理員面板',");
code = code.replace("adminConsole: 'Admin Console',", "adminConsole: 'Admin Console',\n      adminDrawer: 'Administrator Drawer',");

code = code.replace('>Administrator Drawer</span>', '>{dict.adminDrawer}</span>');

fs.writeFileSync('src/App.tsx', code);
