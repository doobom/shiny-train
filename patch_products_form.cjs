const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const addForm = `
          {showAddForm && (
            <form onSubmit={handleCreateProduct} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mb-4 space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name (ZH)</label>
                  <input type="text" required value={nameZh} onChange={e=>setNameZh(e.target.value)} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name (EN)</label>
                  <input type="text" required value={nameEn} onChange={e=>setNameEn(e.target.value)} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                  <select value={categoryId} onChange={e=>setCategoryId(e.target.value)} className="w-full border p-2 rounded text-xs bg-white">
                    {categories.map(c => <option key={c.id} value={c.id}>{c.nameZh}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Image URL (or upload)</label>
                  <div className="flex gap-2">
                    <input type="text" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} className="flex-1 border p-2 rounded text-xs" />
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-xs font-bold flex items-center">
                      {isUploading ? '...' : 'Upload'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-xs font-bold border rounded-lg text-gray-600">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg">Publish</button>
              </div>
            </form>
          )}
`;

code = code.replace(
  /\{\/\* Quick Stock Edit \*\/\}/,
  addForm + '\n          {/* Quick Stock Edit */}'
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
