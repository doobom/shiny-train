const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const target1 = `const handleBatchStatus = (status: 'on_shelf' | 'off_shelf') => {`;
const replace1 = `const handleBatchDiscount = () => {
    if (!selectedProductIds.length) return;
    const discountStr = prompt(locale === 'zh-HK' ? '输入折扣百分比 (例如输入10表示打9折)' : 'Enter discount percentage (e.g. 10 for 10% off)');
    if (!discountStr) return;
    const discountPercent = Number(discountStr);
    if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) return alert('Invalid discount');
    apiFetch('/api/admin/products/batch-discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: selectedProductIds, discountPercent })
    }).then(() => {
      setNotif(locale === 'zh-HK' ? '批量折扣设置成功' : 'Batch discount applied');
      setSelectedProductIds([]);
      fetchCatalog();
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleBatchStatus = (status: 'on_shelf' | 'off_shelf') => {`;

const target2 = `</button>
            <button onClick={() => handleBatchStatus('off_shelf')} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              {locale === 'zh-HK' ? '批量下架' : 'Batch Unpublish'}
            </button>`;
const replace2 = `</button>
            <button onClick={() => handleBatchStatus('off_shelf')} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              {locale === 'zh-HK' ? '批量下架' : 'Batch Unpublish'}
            </button>
            <button onClick={handleBatchDiscount} className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              {locale === 'zh-HK' ? '批量折扣' : 'Batch Discount'}
            </button>`;

code = code.replace(target1, replace1).replace(target2, replace2);
fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
