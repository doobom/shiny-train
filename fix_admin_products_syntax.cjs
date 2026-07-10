const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf-8');

code = code.replace(
  "const [categoryId,\n      imageUrl, setCategoryId] = useState('');\n  const [imageUrl, setImageUrl] = useState('');",
  "const [categoryId, setCategoryId] = useState('');\n  const [imageUrl, setImageUrl] = useState('');"
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
