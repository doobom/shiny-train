const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

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
      setTimeout(() => setNotif(null), 3000);
    });
  };`;

const createFuncReplace = `  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameZh || !nameEn) return;
    
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
      setTimeout(() => setNotif(null), 3000);
    });
  };

  const handleEditProduct = (prod: any) => {
    setEditingProductId(prod.id);
    setNameZh(prod.nameZh || '');
    setNameEn(prod.nameEn || '');
    setDescriptionZh(prod.descriptionZh || '');
    setDescriptionEn(prod.descriptionEn || '');
    setOriginalCents(prod.priceOriginalCents || 0);
    setAfterCents(prod.priceAfterCents || 0);
    setCategoryId(prod.categoryId || '');
    setImageUrl(prod.images?.[0] || '');
    setShowAddForm(true);
  };`;
  
if (code.includes(createFuncTarget)) {
  code = code.replace(createFuncTarget, createFuncReplace);
  fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
  console.log("Patched successfully!");
} else {
  console.log("Could not find target!");
}
