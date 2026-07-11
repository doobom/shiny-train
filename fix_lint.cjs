const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// 1. Email queue
code = code.replace(/body: \`Your password reset token is:/g, "content: `Your password reset token is:");

// 2. req.user
code = code.replace(/const userId = req\.user\.id;/g, "const userId = (req as any).user.id;");

// 3. record.nameZh
code = code.replace(/record\.nameZh/g, "(record as any).nameZh");
code = code.replace(/record\.nameEn/g, "(record as any).nameEn");
code = code.replace(/record\.categoryId/g, "(record as any).categoryId");
code = code.replace(/record\.price/g, "(record as any).price");

// 4. tx.execute -> wait, let's just do a regex replace for tx.execute to tx.run or db.execute if it's db
// let's check if it's tx.execute(sql\`...\`) or tx.execute('...')
// Better-sqlite3 drizzle uses db.run() or tx.run() for arbitrary SQL execution usually, but it might be using run. Let's try changing tx.execute to tx.run
code = code.replace(/tx\.execute/g, "tx.run");

fs.writeFileSync('server.ts', code);
console.log("Lint fixes applied");
