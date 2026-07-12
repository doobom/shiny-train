const fs = require('fs');
let code = fs.readFileSync('src/server/seed.ts', 'utf8');

// Categories
code = code.replace(/nameEn: 'Electronics', sort: 1 }/g, "nameEn: 'Electronics', sort: 1, disabled: false }");
code = code.replace(/nameEn: 'Home Living', sort: 2 }/g, "nameEn: 'Home Living', sort: 2, disabled: false }");
code = code.replace(/nameEn: 'Sports', sort: 3 }/g, "nameEn: 'Sports', sort: 3, disabled: false }");

fs.writeFileSync('src/server/seed.ts', code);
