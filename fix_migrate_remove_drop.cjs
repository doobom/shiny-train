const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

code = code.replace(/try \{ await db\.execute\(sql`DROP TABLE IF EXISTS drizzle\.__drizzle_migrations`\); await db\.execute\(sql`DROP TABLE IF EXISTS __drizzle_migrations`\); \} catch\(e\) \{ console\.error\("Drop failed:", e\); \}/g, "");
code = code.replace(/console\.log\("Dropping migrations table\.\.\."\);/g, "");

fs.writeFileSync('src/server/db.ts', code);
