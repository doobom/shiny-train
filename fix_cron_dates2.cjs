const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/thirtyMinsAgo\.getTime\(\)/g, "thirtyMinsAgo.toISOString()");
code = code.replace(/sevenDaysAgo\.getTime\(\)/g, "sevenDaysAgo.toISOString()");

fs.writeFileSync('server.ts', code);
console.log("Cron dates fixed to ISOString");
