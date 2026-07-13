const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import\.meta\.env\.VITE_B_FRONTEND_URL/g, "(import.meta.env.B_FRONTEND_URL || import.meta.env.VITE_B_FRONTEND_URL)");
code = code.replace(/import\.meta\.env\.VITE_C_FRONTEND_URL/g, "(import.meta.env.C_FRONTEND_URL || import.meta.env.VITE_C_FRONTEND_URL)");

fs.writeFileSync('src/App.tsx', code);
