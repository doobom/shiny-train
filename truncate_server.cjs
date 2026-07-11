const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const prodIndex = code.indexOf("console.log(`[Prod] Server running on port ${PORT}`);");
if (prodIndex !== -1) {
  const endBlock = code.indexOf('}', prodIndex);
  if (endBlock !== -1) {
    const finalEnd = code.indexOf('}', endBlock + 1);
    if (finalEnd !== -1) {
      code = code.substring(0, finalEnd + 1) + '\n';
      fs.writeFileSync('server.ts', code);
    }
  }
}
