const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminMarketing.tsx', 'utf8');

const endIndex = code.indexOf('    </div>\n  );\n}');
if (endIndex !== -1) {
  code = code.substring(0, endIndex + '    </div>\n  );\n}'.length);
}

fs.writeFileSync('src/components/admin/AdminMarketing.tsx', code);
