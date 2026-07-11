const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import { migrate } from './src/server/db.js';")) {
  code = "import { migrate } from './src/server/db.js';\n" + code;
}

code = code.replace("app.listen(PORT, '0.0.0.0', () => {", "migrate().then(() => {\n      app.listen(PORT, '0.0.0.0', () => {");
code = code.replace(/console\.log\(\`\[Dev\] Server running on http:\/\/localhost:\$\{PORT\}\`\);\n    \}\);/g, "console.log(`[Dev] Server running on http://localhost:${PORT}`);\n    });\n    }).catch(console.error);");
code = code.replace(/console\.log\(\`\[Prod\] Server running on port \$\{PORT\}\`\);\n  \}\);/g, "console.log(`[Prod] Server running on port ${PORT}`);\n  });\n  }).catch(console.error);");

fs.writeFileSync('server.ts', code);
