const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminSettings.tsx', 'utf8');

// Inject new state variables for limits
code = code.replace(
  "const [warnThreshold, setWarnThreshold] = useState(15);",
  "const [warnThreshold, setWarnThreshold] = useState(15);\n  const [maxPerItem, setMaxPerItem] = useState(999);\n  const [maxTotal, setMaxTotal] = useState(9999);"
);
fs.writeFileSync('src/components/admin/AdminSettings.tsx', code);
