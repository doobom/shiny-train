const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminMarketing.tsx', 'utf8');

code = code.replace(
  `  const [reductions, setReductions] = useState<any[]>([]);`,
  `  const [activeTab, setActiveTab] = useState<'reductions' | 'coupons'>('reductions');\n  const [reductions, setReductions] = useState<any[]>([]);`
);

fs.writeFileSync('src/components/admin/AdminMarketing.tsx', code);
