const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/tx\.run/g, "tx.execute");
// wait, earlier I replaced rowCount with changes. PostgreSQL result has rowCount!
code = code.replace(/res\.changes/g, "res.rowCount");
code = code.replace(/res\.rowCount === 0/g, "res.rowCount === 0");

fs.writeFileSync('server.ts', code);
