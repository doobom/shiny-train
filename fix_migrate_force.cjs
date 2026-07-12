const fs = require('fs');
let code = fs.readFileSync('src/server/db.ts', 'utf8');

code = code.replace(
  `await migrateNodePg(db, { migrationsFolder: './drizzle' });`,
  `console.log("Dropping migrations table...");
    try { await db.execute('DROP TABLE IF EXISTS __drizzle_migrations'); } catch(e) { console.error("Drop failed:", e); }
    console.log("Running migrations...");
    await migrateNodePg(db, { migrationsFolder: './drizzle' });`
);

fs.writeFileSync('src/server/db.ts', code);
