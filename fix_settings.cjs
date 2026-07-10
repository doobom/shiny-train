const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  "await tx.update(schema.platformSettings).set({ value }).where(eq(schema.platformSettings.key, key));",
  "await tx.update(schema.platformSettings).set({ value: String(value) }).where(eq(schema.platformSettings.key, key));"
);
code = code.replace(
  "await tx.insert(schema.platformSettings).values({ key, value });",
  "await tx.insert(schema.platformSettings).values({ key, value: String(value) });"
);

fs.writeFileSync('server.ts', code);
