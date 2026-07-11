const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /      addressRecipient: address\.recipient,\n      addressPhone: address\.phone,\n      addressDetail: address\.detail,/,
  "      addressRecipient: address.recipient,\n      addressPhone: encrypt(address.phone),\n      addressDetail: encrypt(address.detail),"
);

fs.writeFileSync('server.ts', code);
