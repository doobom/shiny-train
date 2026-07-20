const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminProducts.tsx', 'utf8');

const priceFields = `
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "原價 (HKD)" : "Original Price"}</label>
                  <input type="number" step="0.01" required value={originalCents / 100} onChange={e=>setOriginalCents(Math.round(Number(e.target.value) * 100))} className="w-full border p-2 rounded text-xs" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "售價 (HKD)" : "Sale Price"}</label>
                  <input type="number" step="0.01" required value={afterCents / 100} onChange={e=>setAfterCents(Math.round(Number(e.target.value) * 100))} className="w-full border p-2 rounded text-xs" />
                </div>
                {!editingProductId && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "初始庫存" : "Initial Stock"}</label>
                      <input type="number" required value={initialStock} onChange={e=>setInitialStock(Number(e.target.value))} className="w-full border p-2 rounded text-xs" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "庫存警告線" : "Warn Threshold"}</label>
                      <input type="number" required value={warnThreshold} onChange={e=>setWarnThreshold(Number(e.target.value))} className="w-full border p-2 rounded text-xs" />
                    </div>
                  </>
                )}
`;

code = code.replace(/<div className="space-y-1">\s*<label className="text-\[10px\] font-bold text-gray-500 uppercase">\{locale === "zh-HK" \? "圖片網址 \(或上傳\)" : "Image URL \(or upload\)"\}<\/label>/, priceFields + '\n                <div className="space-y-1">\n                  <label className="text-[10px] font-bold text-gray-500 uppercase">{locale === "zh-HK" ? "圖片網址 (或上傳)" : "Image URL (or upload)"}</label>');

fs.writeFileSync('src/components/admin/AdminProducts.tsx', code);
