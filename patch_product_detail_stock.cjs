const fs = require('fs');
let code = fs.readFileSync('src/components/shop/ProductDetail.tsx', 'utf8');

code = code.replace(
  `{dict.lowStock} (僅餘 {selectedSpec.availableStock} 件)`,
  `{dict.lowStock} ({locale === 'zh-HK' ? '僅餘' : 'Only'} {selectedSpec.availableStock} {locale === 'zh-HK' ? '件' : 'left'})`
);

code = code.replace(
  `{dict.available} (現貨充足)`,
  `{dict.available}`
);

fs.writeFileSync('src/components/shop/ProductDetail.tsx', code);
