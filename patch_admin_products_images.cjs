const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

code = code.replace(`const [imageUrl, setImageUrl] = useState('');`, `const [imageUrls, setImageUrls] = useState('');`);
code = code.replace(`setImageUrl('');`, `setImageUrls('');`); // in resetForm

code = code.replace(`imageUrls: imageUrl ? [imageUrl] : [],`, `imageUrls: imageUrls ? imageUrls.split(',').map(s => s.trim()).filter(Boolean) : [],`);

code = code.replace(`setImageUrl(prod.images?.[0] || '');`, `setImageUrls(prod.images?.join(', ') || '');`);

code = code.replace(`<label className="text-[10px] font-bold text-gray-500 uppercase block">Main Image URL</label>`, `<label className="text-[10px] font-bold text-gray-500 uppercase block">Main Image URLs (comma separated)</label>`);

code = code.replace(`<input type="text" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="flex-1 border p-2 rounded text-xs" />`, `<textarea rows={2} value={imageUrls} onChange={e=>setImageUrls(e.target.value)} className="flex-1 w-full border p-2 rounded text-xs" />`);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
