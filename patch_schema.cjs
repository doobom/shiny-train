const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace(/"role_code" text REFERENCES "roles"\("code"\)/g, '"role_id" text REFERENCES "roles"("id")');
code = code.replace(/"permission" text NOT NULL/g, '"module" text NOT NULL');

// Also add a patch to drop the bad table and recreate if missing column
code = code.replace('try {', `try {\n    await db.execute(require('drizzle-orm').sql.raw(\`ALTER TABLE "role_permissions" RENAME COLUMN "role_code" TO "role_id"\`)).catch(() => {});\n    await db.execute(require('drizzle-orm').sql.raw(\`ALTER TABLE "role_permissions" RENAME COLUMN "permission" TO "module"\`)).catch(() => {});\n`);

fs.writeFileSync('server.ts', code);
