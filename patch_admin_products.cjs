const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetAddBtn = `<button onClick={() => setShowAddForm(true)} className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg">
              + {locale === 'zh-HK' ? '新增商品' : 'Add Product'}
            </button>`;

const replaceAddBtn = `<div className="flex gap-2">
              <label className="bg-gray-200 text-gray-800 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300">
                {locale === 'zh-HK' ? '批量導入' : 'Import CSV'}
                <input type="file" className="hidden" accept=".csv" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append('file', file);
                  const res = await apiFetch('/api/admin/products/import', {
                    method: 'POST',
                    body: formData
                  });
                  if (res.ok) {
                    alert('Imported successfully');
                    fetchData();
                  }
                }} />
              </label>
              <button onClick={() => setShowAddForm(true)} className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg">
                + {locale === 'zh-HK' ? '新增商品' : 'Add Product'}
              </button>
            </div>`;

code = code.replace(targetAddBtn, replaceAddBtn);
fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
