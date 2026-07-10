const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Fix s.afterCents
code = code.replace(
  "s.afterCents",
  "s.priceAfterCents"
);
// Fix grandTotalCents typing
code = code.replace(
  "totalSalesCents += order.grandTotalCents;",
  "totalSalesCents += Number(order.grandTotalCents);"
);

fs.writeFileSync('server.ts', code);
