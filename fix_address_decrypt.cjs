const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For /api/orders/mine/:userId
code = code.replace(
  /order\.addressRecipient,\n      addressPhone: order\.addressPhone,\n      addressDetail: order\.addressDetail,/,
  "order.addressRecipient,\n      addressPhone: decrypt(order.addressPhone),\n      addressDetail: decrypt(order.addressDetail),"
);

// For /api/admin/orders
code = code.replace(
  /order\.addressRecipient,\n        addressPhone: order\.addressPhone,\n        addressDetail: order\.addressDetail,/,
  "order.addressRecipient,\n        addressPhone: decrypt(order.addressPhone),\n        addressDetail: decrypt(order.addressDetail),"
);

fs.writeFileSync('server.ts', code);
