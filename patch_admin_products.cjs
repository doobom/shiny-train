const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetStr1 = `  const [nameEn, setNameEn] = useState('');
  const [categoryId, setCategoryId] = useState('');`;

const replaceStr1 = `  const [nameEn, setNameEn] = useState('');
  const [descriptionZh, setDescriptionZh] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [categoryId, setCategoryId] = useState('');`;

code = code.replace(targetStr1, replaceStr1);

const targetStr2 = `const payload = {
      nameZh, nameEn, priceOriginalCents: originalCents, priceAfterCents: afterCents,`;

const replaceStr2 = `const payload = {
      nameZh, nameEn, descriptionZh, descriptionEn, priceOriginalCents: originalCents, priceAfterCents: afterCents,`;

code = code.replace(targetStr2, replaceStr2);

const targetStr3 = `import { ShoppingBag, PlusCircle`;
const replaceStr3 = `import ReactQuill from 'react-quill';\nimport 'react-quill/dist/quill.snow.css';\nimport { ShoppingBag, PlusCircle`;

code = code.replace(targetStr3, replaceStr3);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
