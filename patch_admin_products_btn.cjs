const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

code = code.replace(
  `onClick={() => { if (!showAddForm) resetForm(); setShowAddForm(!showAddForm); }}`,
  `onClick={() => { resetForm(); setShowAddForm(true); }}`
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
