const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldMap = `  const mapped = items.map(item => {
    const spec = specs.find(s => s.id === item.skuId);
    if (!spec) return null;
    const prod = prods.find(p => p.id === spec.productId);
    if (!prod) return null;
    const inv = invs.find(i => i.skuId === spec.id);
    return {
      id: item.id,
      skuId: item.skuId,
      qty: item.qty,
      checked: item.checked,
      productNameZh: prod.nameZh,
      productNameEn: prod.nameEn,
      specNameZh: spec.specNameZh,
      specNameEn: spec.specNameEn,
      priceOriginalCents: spec.priceOriginalCents,
      priceAfterCents: spec.priceAfterCents,
      images: prod.images,
      stock: inv?.stock || 0
    };
  }).filter(Boolean);`;

const newMap = `  const mapped = items.map(item => {
    const spec = specs.find(s => s.id === item.skuId);
    if (!spec) return null;
    const prod = prods.find(p => p.id === spec.productId);
    if (!prod) return null;
    return {
      id: item.id,
      cartId: item.cartId,
      skuId: item.skuId,
      qty: item.qty,
      checked: item.checked,
      spec: spec,
      product: prod
    };
  }).filter(Boolean);`;

code = code.replace(oldMap, newMap);
fs.writeFileSync('server.ts', code);
