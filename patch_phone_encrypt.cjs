const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /phoneEncrypted: phone,/,
  "phoneEncrypted: encrypt(phone),"
);

fs.writeFileSync('server.ts', code);
