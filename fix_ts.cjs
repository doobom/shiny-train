const fs = require('fs');

const files = ['src/components/admin/AdminMarketing.tsx', 'src/components/shop/ProductDetail.tsx'];

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  code = code.replace(/import { (.*) } from '\.\.\/\.\.\/types\/index\.ts';/g, "import { $1 } from '../../types/index';");
  fs.writeFileSync(f, code);
});
