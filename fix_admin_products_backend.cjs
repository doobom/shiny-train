const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "priceAfterCents: data.priceAfterCents",
  "priceAfterCents: data.priceAfterCents,\n    categoryId: data.categoryId,\n    images: data.imageUrl ? [data.imageUrl] : []"
);

fs.writeFileSync('server.ts', code);
