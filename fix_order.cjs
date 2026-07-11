const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the if (process.env.NODE_ENV !== 'production') block
const viteBlockRegex = /if \(process\.env\.NODE_ENV !== 'production'\) \{[\s\S]*?\} else \{ \{[\s\S]*?console\.log\(`\[Prod\] Server running on port \$\{PORT\}`\);\n  \}\);\n\}/m;

const match = code.match(viteBlockRegex);
if (match) {
  let viteBlock = match[0];
  // Remove it from current position
  code = code.replace(viteBlockRegex, '');
  
  // Fix the syntax error in viteBlock
  viteBlock = viteBlock.replace(/\} else \{ \{/, '} else {');
  
  // Append it to the very end of the file
  code = code + '\n' + viteBlock + '\n';
  fs.writeFileSync('server.ts', code);
} else {
  console.log("Could not find vite block");
}
