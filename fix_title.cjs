const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');
const effectToInsert = `  useEffect(() => {
    document.title = locale === 'zh-HK' ? '香港生活百貨商城' : 'HK Life Mall';
  }, [locale]);\n`;
code = code.replace("useEffect(() => {\n    const token = localStorage.getItem('jwt_token');", effectToInsert + "\n  useEffect(() => {\n    const token = localStorage.getItem('jwt_token');");
fs.writeFileSync('src/App.tsx', code);
