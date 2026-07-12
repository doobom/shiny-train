const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/{ error: 'Exceeded maximum total items per order \(' \+ maxTotal \+ '\)' }/g, 
  "{ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum total items per order (' + maxTotal + ')' }");

code = code.replace(/{ error: 'Exceeded maximum quantity for a single item \(' \+ maxPerItem \+ '\)' }/g,
  "{ code: 'PURCHASE_LIMIT_EXCEEDED', message: 'Exceeded maximum quantity for a single item (' + maxPerItem + ')' }");

fs.writeFileSync('server.ts', code);
