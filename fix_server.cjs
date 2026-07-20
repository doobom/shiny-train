const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/\}\);\n\}\);\n\napp\.post/g, '});\n\napp.post');
code = code.replace(/\}\);\n\}\);\n  res\.json/g, '});\n\n  res.json');
code = code.replace(/res\.json\(\{ success: true \}\);\n\}\);\n\}\);\n  res\.json\(\{ success: true, id \}\);\n\}\);\n\}\);/g, '  res.json({ success: true });\n});');

fs.writeFileSync('server.ts', code);
