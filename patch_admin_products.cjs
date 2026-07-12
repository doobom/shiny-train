const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const importTarget = `import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';`;

code = code.replace(importTarget, '');

const quillTarget1 = `<ReactQuill theme="snow" value={descriptionZh} onChange={setDescriptionZh} className="bg-white" />`;
const quillReplace1 = `<textarea rows={4} value={descriptionZh} onChange={e => setDescriptionZh(e.target.value)} className="w-full border p-2 rounded text-xs bg-white focus:outline-none focus:border-neutral-900" />`;
code = code.replace(quillTarget1, quillReplace1);

const quillTarget2 = `<ReactQuill theme="snow" value={descriptionEn} onChange={setDescriptionEn} className="bg-white" />`;
const quillReplace2 = `<textarea rows={4} value={descriptionEn} onChange={e => setDescriptionEn(e.target.value)} className="w-full border p-2 rounded text-xs bg-white focus:outline-none focus:border-neutral-900" />`;
code = code.replace(quillTarget2, quillReplace2);

const formStateTarget = `  const [showAddForm, setShowAddForm] = useState(false);`;
const formStateReplace = `  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);`;
code = code.replace(formStateTarget, formStateReplace);

const createFuncTarget = `  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameZh || !nameEn) return;
    const payload = {
      nameZh, nameEn, descriptionZh, descriptionEn, priceOriginalCents: originalCents, priceAfterCents: afterCents,
      categoryId, imageUrls: imageUrl ? [imageUrl] : [],
      specs: [{ specNameZh, specNameEn, stock: initialStock, warnThreshold }]
    };
    apiFetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      setNotif(locale === 'zh-HK' ? '商品發布成功！' : 'Product launched successfully!');
      setShowAddForm(false);
      fetchCatalog();
    });
  };`;

const createFuncReplace = `  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameZh || !nameEn) return;
    
    // Check if specs need to be included
    let specsPayload = undefined;
    if (!editingProductId) {
       specsPayload = [{ specNameZh, specNameEn, stock: initialStock, warnThreshold }];
    }

    const payload = {
      nameZh, nameEn, descriptionZh, descriptionEn, priceOriginalCents: originalCents, priceAfterCents: afterCents,
      categoryId, imageUrls: imageUrl ? [imageUrl] : [],
      specs: specsPayload
    };

    apiFetch(editingProductId ? \`/api/admin/products/\${editingProductId}\` : '/api/admin/products', {
      method: editingProductId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
      setNotif(locale === 'zh-HK' ? (editingProductId ? '商品更新成功！' : '商品發布成功！') : (editingProductId ? 'Product updated successfully!' : 'Product launched successfully!'));
      setShowAddForm(false);
      setEditingProductId(null);
      fetchCatalog();
    });
  };

  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setNameZh(prod.nameZh);
    setNameEn(prod.nameEn);
    setDescriptionZh(prod.descriptionZh || '');
    setDescriptionEn(prod.descriptionEn || '');
    setOriginalCents(prod.priceOriginalCents);
    setAfterCents(prod.priceAfterCents);
    setCategoryId(prod.categoryId || '');
    setImageUrl(prod.images?.[0] || '');
    setShowAddForm(true);
  };`;
code = code.replace(createFuncTarget, createFuncReplace);

const tableActionTarget = `<td className="p-4 text-right">
                      <button onClick={() => toggleShelf(prod.id, prod.status)} className="border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-[10px] font-bold px-2 py-1 rounded">
                        {prod.status === 'on_shelf' ? '下架' : '上架'}
                      </button>
                    </td>`;
const tableActionReplace = `<td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleEditProduct(prod)} className="border border-amber-200 hover:bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">
                        {locale === 'zh-HK' ? '編輯' : 'Edit'}
                      </button>
                      <button onClick={() => toggleShelf(prod.id, prod.status)} className="border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-[10px] font-bold px-2 py-1 rounded">
                        {prod.status === 'on_shelf' ? '下架' : '上架'}
                      </button>
                    </td>`;
code = code.replace(tableActionTarget, tableActionReplace);

const cancelBtnTarget = `<button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs font-bold border rounded-lg text-gray-600">Cancel</button>`;
const cancelBtnReplace = `<button type="button" onClick={() => { setShowAddForm(false); setEditingProductId(null); }} className="px-4 py-2 text-xs font-bold border rounded-lg text-gray-600">Cancel</button>`;
code = code.replace(cancelBtnTarget, cancelBtnReplace);

const publishBtnTarget = `<button type="submit" className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg">Publish</button>`;
const publishBtnReplace = `<button type="submit" className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg">{editingProductId ? 'Update' : 'Publish'}</button>`;
code = code.replace(publishBtnTarget, publishBtnReplace);

const addBtnTarget = `<button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> Add Product
            </button>`;
const addBtnReplace = `<button 
              onClick={() => {
                setEditingProductId(null);
                setNameZh(''); setNameEn(''); setDescriptionZh(''); setDescriptionEn(''); setImageUrl(''); setCategoryId('');
                setShowAddForm(!showAddForm);
              }}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" /> Add Product
            </button>`;
code = code.replace(addBtnTarget, addBtnReplace);

const specFieldsTarget = `<div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Spec Name (ZH)</label>
                  <input type="text" value={specNameZh} onChange={e=>setSpecNameZh(e.target.value)} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Spec Name (EN)</label>
                  <input type="text" value={specNameEn} onChange={e=>setSpecNameEn(e.target.value)} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Initial Stock</label>
                  <input type="number" value={initialStock} onChange={e=>setInitialStock(Number(e.target.value))} className="w-full border p-2 rounded text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Warn Threshold</label>
                  <input type="number" value={warnThreshold} onChange={e=>setWarnThreshold(Number(e.target.value))} className="w-full border p-2 rounded text-xs font-mono" />
                </div>`;

const specFieldsReplace = `{!editingProductId && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Spec Name (ZH)</label>
                    <input type="text" value={specNameZh} onChange={e=>setSpecNameZh(e.target.value)} className="w-full border p-2 rounded text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Spec Name (EN)</label>
                    <input type="text" value={specNameEn} onChange={e=>setSpecNameEn(e.target.value)} className="w-full border p-2 rounded text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Initial Stock</label>
                    <input type="number" value={initialStock} onChange={e=>setInitialStock(Number(e.target.value))} className="w-full border p-2 rounded text-xs font-mono" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Warn Threshold</label>
                    <input type="number" value={warnThreshold} onChange={e=>setWarnThreshold(Number(e.target.value))} className="w-full border p-2 rounded text-xs font-mono" />
                  </div>
                </>
              )}`;
code = code.replace(specFieldsTarget, specFieldsReplace);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
