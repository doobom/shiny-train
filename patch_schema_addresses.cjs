const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf8');

code = code.replace(
  "isDefault: boolean('is_default').default(false),",
  "isDefault: boolean('is_default').default(false),\n  remark: text('remark'),"
);

fs.writeFileSync('src/server/schema.ts', code);
