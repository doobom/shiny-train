const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetButtons = `<button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {locale === 'zh-HK' ? '發布新商品' : 'Add Product'}
            </button>`;

const replaceButtons = `<div className="flex gap-2">
            <label className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer">
              <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                if(!e.target.files?.length) return;
                const formData = new FormData();
                formData.append('file', e.target.files[0]);
                setLoading(true);
                const res = await apiFetch('/api/admin/products/import', { method: 'POST', body: formData });
                await res.json();
                setLoading(false);
                fetchCatalog();
              }} />
              {locale === 'zh-HK' ? '匯入' : 'Import'}
            </label>
            <button onClick={() => {
              const csv = 'ID,NameZh,NameEn,CategoryId,PriceOriginal,PriceAfter,Status\\n' + products.map(p => \`"\${p.id}","\${p.nameZh}","\${p.nameEn}","\${p.categoryId}","\${p.priceOriginalCents}","\${p.priceAfterCents}","\${p.status}"\`).join('\\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'products.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5">
              {locale === 'zh-HK' ? '匯出' : 'Export'}
            </button>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {locale === 'zh-HK' ? '發布新商品' : 'Add Product'}
            </button>
          </div>`;

code = code.replace(targetButtons, replaceButtons);
fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
