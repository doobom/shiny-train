const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

code = code.replace(
  `try { await db.execute('DROP TABLE IF EXISTS __drizzle_migrations'); } catch(e) { console.error("Drop failed:", e); }`,
  `try { await db.execute('DROP TABLE IF EXISTS drizzle.__drizzle_migrations'); await db.execute('DROP TABLE IF EXISTS __drizzle_migrations'); } catch(e) { console.error("Drop failed:", e); }`
);

fs.writeFileSync('src/server/db.ts', code);
