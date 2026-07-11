const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// Find the first instance of init-db handler and keep it, but remove the second duplicate part
// that seems to repeat multerS3, seedDatabase, init-db, etc.

const firstInitDbIndex = code.indexOf("app.post('/api/admin/init-db', async (req, res) => {");
if (firstInitDbIndex > -1) {
  const secondInitDbIndex = code.indexOf("app.post('/api/admin/init-db'", firstInitDbIndex + 10);
  if (secondInitDbIndex > -1) {
    console.log('Found second init-db duplicate. Cleaning up...');
    
    // We should probably just do a regex replace to remove the second block
    code = code.replace(
      /\/\/ Example: curl -X POST http:\/\/localhost:3000\/api\/admin\/init-db[\s\S]*?app\.post\('\/api\/admin\/init-db', async \(req, res\) => \{[\s\S]*?console\.error\('Initialization error:', error\);\n    res\.status\(500\)\.json\(\{ success: false, message: 'Failed to initialize database', error: error\.message \}\);\n  \}\n\}\);\n\n\n/m,
      ""
    );
    fs.writeFileSync('server.ts', code);
  }
}
