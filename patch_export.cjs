const fs = require('fs');

function exportFunc() {
  return `
  const exportToCSV = () => {
    // Basic CSV export
    let csv = '';
    // This is a placeholder injected by script
  };`;
}

let codeOrders = fs.readFileSync('src/components/admin/AdminOrders.tsx', 'utf8');
const exportOrdersTarget = `window.open('/api/admin/orders/export?token=' + localStorage.getItem('token'), '_blank');`;
const exportOrdersReplace = `
    const csv = 'OrderID,Status,UserId,TotalCents,CreatedAt\\n' + orders.map(o => \`"\${o.id}","\${o.status}","\${o.userId}","\${o.grandTotalCents}","\${o.createdAt}"\`).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
`;
codeOrders = codeOrders.replace(exportOrdersTarget, exportOrdersReplace);
fs.writeFileSync('src/components/admin/AdminOrders.tsx', codeOrders);

let codeProducts = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');
const exportProductsTarget = `window.open('/api/admin/products/export?token=' + localStorage.getItem('token'), '_blank');`;
const exportProductsReplace = `
    const csv = 'ID,NameZh,NameEn,CategoryId,PriceOriginal,PriceAfter,Status\\n' + products.map(p => \`"\${p.id}","\${p.nameZh}","\${p.nameEn}","\${p.categoryId}","\${p.priceOriginalCents}","\${p.priceAfterCents}","\${p.status}"\`).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
`;
codeProducts = codeProducts.replace(exportProductsTarget, exportProductsReplace);
fs.writeFileSync('src/components/admin/AdminProducts.tsx', codeProducts);

