const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const targetButtons = `<button onClick={fetchCatalog} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm">
            <RefreshCw className="h-4 w-4" />
            {locale === 'zh-HK' ? '刷新' : 'Refresh'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            {locale === 'zh-HK' ? '新增商品' : 'Add Product'}
          </button>`;

const replaceButtons = `<button onClick={fetchCatalog} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm">
            <RefreshCw className="h-4 w-4" />
            {locale === 'zh-HK' ? '刷新' : 'Refresh'}
          </button>
          <label className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer">
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
            {locale === 'zh-HK' ? '匯入CSV' : 'Import CSV'}
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
          }} className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm">
            {locale === 'zh-HK' ? '匯出CSV' : 'Export CSV'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <PlusCircle className="h-4 w-4" />
            {locale === 'zh-HK' ? '新增商品' : 'Add Product'}
          </button>`;

code = code.replace(targetButtons, replaceButtons);
fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
