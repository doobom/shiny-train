const fs = require('fs');
let code = fs.readFileSync('src/components/shop/CartView.tsx', 'utf-8');

// Inject bulk action functions
const bulkFuncs = `
  const handleSelectAll = (checked: boolean) => {
    fetch('/api/cart/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'check', itemIds: items.map(i => i.id), checked })
    })
    .then(() => fetchCart())
    .catch(e => console.error(e));
  };

  const handleDeleteSelected = () => {
    const selectedIds = items.filter(i => i.checked).map(i => i.id);
    if (selectedIds.length === 0) return;
    
    fetch('/api/cart/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', itemIds: selectedIds })
    })
    .then(() => fetchCart())
    .catch(e => console.error(e));
  };

  const selectedItems = items.filter(i => i.checked);
  const allSelected = items.length > 0 && selectedItems.length === items.length;
`;
code = code.replace("  const selectedItems = items.filter(i => i.checked);", bulkFuncs);

// Inject UI for bulk actions
const bulkUI = `      <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">
          <ShoppingBag className="h-5.5 w-5.5 text-amber-500" />
          {dict.title} ({items.length})
        </h1>
        {items.length > 0 && (
          <div className="flex items-center gap-4 text-sm font-semibold">
            <button 
              onClick={() => handleSelectAll(!allSelected)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors"
            >
              {allSelected ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
              {locale === 'zh-HK' ? '全選' : 'Select All'}
            </button>
            <button 
              onClick={handleDeleteSelected}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-1 text-red-500 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              {locale === 'zh-HK' ? '刪除已選' : 'Delete Selected'}
            </button>
          </div>
        )}
      </div>`;

code = code.replace(/      <div className="border-b border-gray-100 pb-4">\s*<h1 className="text-xl font-bold text-gray-900 font-display flex items-center gap-2">\s*<ShoppingBag className="h-5\.5 w-5\.5 text-amber-500" \/>\s*\{dict\.title\} \(\{items\.length\}\)\s*<\/h1>\s*<\/div>/, bulkUI);

fs.writeFileSync('src/components/shop/CartView.tsx', code);
