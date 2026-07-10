const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// I will just use regex to clean the orphaned block
// The block starts with "    if (!user && mappedId === 'usr_2') {"
// And ends with "  res.json({ success: true, token, user: { id: user.id, email: user.email, locale: user.locale } });\n});\n"

const regex = /    if \(!user && mappedId === 'usr_2'\) \{[\s\S]*?res\.json\(\{ success: true, token, user: \{ id: user\.id, email: user\.email, locale: user\.locale \} \}\);\n\}\);\n/g;

code = code.replace(regex, '');
fs.writeFileSync('server.ts', code);
