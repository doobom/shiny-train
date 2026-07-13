const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

code = code.replace(
  '<label className="text-[10px] font-bold text-gray-500 uppercase">Product Name (ZH)</label>',
  '<label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "商品名稱 (中文)" : "Product Name (ZH)"}</label>'
);
code = code.replace(
  '<label className="text-[10px] font-bold text-gray-500 uppercase">Product Name (EN)</label>',
  '<label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "商品名稱 (英文)" : "Product Name (EN)"}</label>'
);
code = code.replace(
  '<label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>',
  '<label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "分類" : "Category"}</label>'
);
code = code.replace(
  '<label className="text-[10px] font-bold text-gray-500 uppercase">Image URL (or upload)</label>',
  '<label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "圖片網址 (或上傳)" : "Image URL (or upload)"}</label>'
);
code = code.replace(
  '<label className="text-[10px] font-bold text-gray-500 uppercase block">Description (ZH)</label>',
  '<label className="text-[10px] font-bold text-gray-500 uppercase block">{locale === "zh-HK" ? "詳細描述 (中文)" : "Description (ZH)"}</label>'
);
code = code.replace(
  '<label className="text-[10px] font-bold text-gray-500 uppercase block">Description (EN)</label>',
  '<label className="text-[10px] font-bold text-gray-500 uppercase block">{locale === "zh-HK" ? "詳細描述 (英文)" : "Description (EN)"}</label>'
);
code = code.replace(
  "{isUploading ? '...' : 'Upload'}",
  "{isUploading ? '...' : (locale === 'zh-HK' ? '上傳' : 'Upload')}"
);

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
