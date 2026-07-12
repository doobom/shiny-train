const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetStr = `  const [warnThreshold, setWarnThreshold] = useState(10);`;

const replaceStr = `  const [warnThreshold, setWarnThreshold] = useState(10);
  
  const resetForm = () => {
    setEditingProductId(null);
    setNameZh('');
    setNameEn('');
    setDescriptionZh('');
    setDescriptionEn('');
    setOriginalCents(0);
    setAfterCents(0);
    setCategoryId('');
    setImageUrl('');
    setSpecNameZh('');
    setSpecNameEn('');
    setInitialStock(0);
    setWarnThreshold(10);
  };`;
code = code.replace(targetStr, replaceStr);

code = code.replace(
  `onClick={() => setShowAddForm(!showAddForm)}`,
  `onClick={() => { if (!showAddForm) resetForm(); setShowAddForm(!showAddForm); }}`
);

code = code.replace(
  `onClick={() => { setShowAddForm(false); setEditingProductId(null); }}`,
  `onClick={() => { setShowAddForm(false); resetForm(); }}`
);

// also in handleCreateProduct
code = code.replace(
  `      setShowAddForm(false);
      setEditingProductId(null);`,
  `      setShowAddForm(false);
      resetForm();`
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
