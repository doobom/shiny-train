const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(`try {\n    await db.execute(require('drizzle-orm').sql.raw(\`ALTER TABLE "role_permissions" RENAME COLUMN "role_code" TO "role_id"\`)).catch(() => {});\n    await db.execute(require('drizzle-orm').sql.raw(\`ALTER TABLE "role_permissions" RENAME COLUMN "permission" TO "module"\`)).catch(() => {});`, 'try {');

const initDbTarget = `app.post('/api/admin/init-db', async (req, res) => {
  try {`;
const initDbReplace = `app.post('/api/admin/init-db', async (req, res) => {
  try {
    await db.execute(require('drizzle-orm').sql.raw(\`ALTER TABLE "role_permissions" RENAME COLUMN "role_code" TO "role_id"\`)).catch(() => {});
    await db.execute(require('drizzle-orm').sql.raw(\`ALTER TABLE "role_permissions" RENAME COLUMN "permission" TO "module"\`)).catch(() => {});`;

code = code.replace(initDbTarget, initDbReplace);
fs.writeFileSync('server.ts', code);
