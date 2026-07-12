const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetStr = `  const [editingProductId, setEditingProductId] = useState<string | null>(null);`;
const replaceStr = `  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };`;
code = code.replace(targetStr, replaceStr);

code = code.replace(/<ReactQuill theme="snow" value=\{descriptionZh\}/g, '<ReactQuill modules={quillModules} theme="snow" value={descriptionZh}');
code = code.replace(/<ReactQuill theme="snow" value=\{descriptionEn\}/g, '<ReactQuill modules={quillModules} theme="snow" value={descriptionEn}');

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
