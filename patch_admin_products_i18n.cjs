const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

code = code.replace(
  `<button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="px-4 py-2 text-xs font-bold border rounded-lg text-gray-600">Cancel</button>`,
  `<button type="button" onClick={() => { setShowAddForm(false); resetForm(); }} className="px-4 py-2 text-xs font-bold border rounded-lg text-gray-600">{locale === 'zh-HK' ? '取消' : 'Cancel'}</button>`
);

code = code.replace(
  `<button type="submit" className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg">{editingProductId ? 'Update' : 'Publish'}</button>`,
  `<button type="submit" className="px-4 py-2 text-xs font-bold bg-gray-900 text-white rounded-lg">{editingProductId ? (locale === 'zh-HK' ? '更新' : 'Update') : (locale === 'zh-HK' ? '發布' : 'Publish')}</button>`
);

code = code.replace(
  `<button onClick={() => setEditingSkuId(null)} className="bg-white text-gray-600 px-3 py-2 rounded text-xs font-bold border">Cancel</button>`,
  `<button onClick={() => setEditingSkuId(null)} className="bg-white text-gray-600 px-3 py-2 rounded text-xs font-bold border">{locale === 'zh-HK' ? '取消' : 'Cancel'}</button>`
);

code = code.replace(
  `<button onClick={() => handleUpdateStock(spec.id)} className="bg-gray-900 text-white px-3 py-2 rounded text-xs font-bold">Save</button>`,
  `<button onClick={() => handleUpdateStock(spec.id)} className="bg-gray-900 text-white px-3 py-2 rounded text-xs font-bold">{locale === 'zh-HK' ? '保存' : 'Save'}</button>`
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
