const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetStr = `  const [warnThreshold, setWarnThreshold] = useState(15);`;
const replaceStr = `  const [warnThreshold, setWarnThreshold] = useState(15);

  const resetForm = () => {
    setEditingProductId(null);
    setNameZh('');
    setNameEn('');
    setDescriptionZh('');
    setDescriptionEn('');
    setOriginalCents(0);
    setAfterCents(0);
    setCategoryId('');
    setImageUrls('');
    setSpecNameZh('');
    setSpecNameEn('');
    setInitialStock(0);
    setWarnThreshold(15);
  };`;

if(code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
  console.log("Patched!");
} else {
  console.log("Not found!");
}
