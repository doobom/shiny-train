const fs = require('fs');

let main = fs.readFileSync('src/main.tsx', 'utf-8');
main = main.replace('const baseUrl = import.meta.env.VITE_API_BASE_URL || \'\';', '// @ts-ignore\n    const baseUrl = import.meta.env.VITE_API_BASE_URL || \'\';');
fs.writeFileSync('src/main.tsx', main);

let app = fs.readFileSync('src/App.tsx', 'utf-8');
app = app.replace('const appMode = import.meta.env.VITE_APP_MODE || \'both\'; // \'user\' | \'admin\' | \'both\'', '// @ts-ignore\n  const appMode = import.meta.env.VITE_APP_MODE || \'both\'; // \'user\' | \'admin\' | \'both\'');
fs.writeFileSync('src/App.tsx', app);
