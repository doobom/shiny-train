const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/sql\`created_at < \$\{thirtyMinsAgo\}\`/g, "sql`created_at < ${thirtyMinsAgo.getTime()}`");
code = code.replace(/sql\`updated_at < \$\{sevenDaysAgo\}\`/g, "sql`updated_at < ${sevenDaysAgo.getTime()}`");

fs.writeFileSync('server.ts', code);
console.log("Cron dates fixed");
