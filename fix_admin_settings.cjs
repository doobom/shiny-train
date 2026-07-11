const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminSettings.tsx', 'utf8');

// Inject new state variables for limits
code = code.replace(
  "const [warnThreshold, setWarnThreshold] = useState(10);",
  "const [warnThreshold, setWarnThreshold] = useState(10);\n  const [maxPerItem, setMaxPerItem] = useState(999);\n  const [maxTotal, setMaxTotal] = useState(9999);"
);

// Read limits
code = code.replace(
  "if (s.key === 'warn_threshold') setWarnThreshold(parseInt(s.value));",
  "if (s.key === 'warn_threshold') setWarnThreshold(parseInt(s.value));\n        if (s.key === 'max_per_item') setMaxPerItem(parseInt(s.value));\n        if (s.key === 'max_total') setMaxTotal(parseInt(s.value));"
);

// Save limits
code = code.replace(
  "warn_threshold: warnThreshold",
  "warn_threshold: warnThreshold, max_per_item: maxPerItem, max_total: maxTotal"
);

// Add dict entries
code = code.replace(
  "thresholdLabel: '默認低庫存預警警戒線 (商品規格數)',",
  "thresholdLabel: '默認低庫存預警警戒線 (商品規格數)',\n      maxPerItemLabel: '單品限購數量上限 (D20)',\n      maxTotalLabel: '單次購物總件數上限 (D20)',"
);
code = code.replace(
  "thresholdLabel: 'Default Inventory Alert Threshold',",
  "thresholdLabel: 'Default Inventory Alert Threshold',\n      maxPerItemLabel: 'Max Qty Per Item (D20)',\n      maxTotalLabel: 'Max Total Qty Per Order (D20)',"
);

// Add UI fields
const uiFields = `
              <div className="space-y-1.5">
                <label>{dict.maxPerItemLabel}</label>
                <input 
                  type="number" 
                  value={maxPerItem} 
                  onChange={e => setMaxPerItem(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>
              <div className="space-y-1.5">
                <label>{dict.maxTotalLabel}</label>
                <input 
                  type="number" 
                  value={maxTotal} 
                  onChange={e => setMaxTotal(Number(e.target.value))} 
                  className="w-full border p-2.5 rounded-lg text-gray-950 font-mono" 
                />
              </div>
`;

code = code.replace(
  /<div className="pt-2">/,
  uiFields + "\n            <div className=\"pt-2\">"
);

fs.writeFileSync('src/components/admin/AdminSettings.tsx', code);
console.log("Admin Settings fixed");
