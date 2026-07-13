const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminMarketing.tsx', 'utf8');

code = code.replace(
  /'滿   const \[reductions, setReductions\]/g,
  `'$', reduceFormat: '-', offFormat: '% OFF', minOrderFormat: 'Min: $', noMinOrder: 'None' }}[locale];\n  const [reductions, setReductions]`
);

fs.writeFileSync('src/components/admin/AdminMarketing.tsx', code);
