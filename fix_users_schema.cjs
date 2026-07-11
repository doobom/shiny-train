const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(/  addressRecipient: varchar\('address_recipient', \{ length: 100 \}\),\n/g, '');
code = code.replace(/  addressPhone: varchar\('address_phone', \{ length: 50 \}\),\n/g, '');
code = code.replace(/  addressDetail: text\('address_detail'\),\n/g, '');

fs.writeFileSync('src/server/schema.ts', code);
