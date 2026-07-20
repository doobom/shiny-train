const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The issue might just be the one I introduced with my bad curly brace fixing scripts.
