const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf-8');

// Add imageUrl state
code = code.replace(
  "const [categoryId, setCategoryId] = useState('');",
  "const [categoryId, setCategoryId] = useState('');\n  const [imageUrl, setImageUrl] = useState('');\n  const [isUploading, setIsUploading] = useState(false);"
);

// Add Image Upload handler
const uploadHandler = `
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    
    try {
      // Need a way to pass authorization token
      const token = localStorage.getItem('jwt_token');
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': \`Bearer \${token}\` },
        body: formData
      });
      const data = await res.json();
      if (data.url) setImageUrl(data.url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };
`;
code = code.replace(
  "const handleCreateProduct = (e: React.FormEvent) => {",
  uploadHandler + "\n  const handleCreateProduct = (e: React.FormEvent) => {"
);

// Add imageUrl to payload
code = code.replace(
  "categoryId,",
  "categoryId,\n      imageUrl,"
);

// Clear imageUrl after success
code = code.replace(
  "setNameEn('');",
  "setNameEn('');\n      setImageUrl('');"
);

// Add UI for image upload
const fileInput = `
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">{locale === 'zh-HK' ? '商品圖片上傳' : 'Upload Product Image'}</label>
              <div className="flex items-center gap-4">
                {imageUrl && <img src={imageUrl} alt="preview" className="h-16 w-16 object-cover rounded-lg border" />}
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="w-full border p-2 rounded-lg text-sm bg-white" />
                {isUploading && <span className="text-xs text-amber-600 font-bold">Uploading...</span>}
              </div>
              <p className="text-xs text-gray-500">
                {locale === 'zh-HK' 
                  ? '選擇本機圖片上傳至 Cloudinary (需要在 .env 設置相關金鑰)。如果未設置則默認為 Mock 圖片。' 
                  : 'Select a local image to upload to Cloudinary (requires keys in .env). Mocks if not set.'}
              </p>
            </div>
`;
code = code.replace(
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-5">',
  '<div className="grid grid-cols-1 md:grid-cols-2 gap-5">\n' + fileInput
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
