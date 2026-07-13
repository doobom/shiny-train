const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminMarketing.tsx', 'utf8');

// Find the first index of 'export default function AdminMarketing'
const firstIndex = code.indexOf('export default function AdminMarketing');
// Find the SECOND index
const secondIndex = code.indexOf('export default function AdminMarketing', firstIndex + 1);

let goodCode = secondIndex !== -1 ? code.substring(0, secondIndex) : code;

// Now let's fix the broken dict definition!
// The broken part:
//      thresholdFormat: '滿   const [reductions, setReductions] = useState<any[]>([]);
goodCode = goodCode.replace(
  /'滿   const \[reductions, setReductions\]/g,
  `'$', reduceFormat: '-', offFormat: '% OFF', minOrderFormat: 'Min: $', noMinOrder: 'None' }}[locale];\n  const [reductions, setReductions]`
);

// Remove the whole dict block
const dictStart = goodCode.indexOf('  const dict = {');
const dictEnd = goodCode.indexOf('  const [reductions, setReductions]');

if (dictStart !== -1 && dictEnd !== -1) {
  const replacementDict = `
  const dict = {
    'zh-HK': {
      reductionsTab: '滿減活動',
      couponsTab: '優惠碼',
      addReduction: '添加滿減',
      addCoupon: '添加優惠碼',
      nameZh: '中文名稱',
      nameEn: '英文名稱',
      threshold: '門檻金額',
      reductionValue: '減免金額',
      stackable: '可疊加使用',
      scope: '適用範圍',
      allProducts: '所有商品',
      specificCategory: '特定分類',
      category: '分類',
      couponCode: '優惠碼',
      type: '類型',
      fixedAmount: '固定金額',
      percentage: '百分比折扣',
      value: '折扣數值',
      minOrder: '最低訂單金額 (選填)',
      save: '儲存',
      cancel: '取消',
      active: '啟用中',
      inactive: '已停用',
      thresholdFormat: '滿 $',
      reduceFormat: '減 $',
      offFormat: '% OFF',
      minOrderFormat: '最低訂單: $',
      noMinOrder: '無門檻',
    },
    'en': {
      reductionsTab: 'Full Reductions',
      couponsTab: 'Coupons',
      addReduction: 'Add Reduction',
      addCoupon: 'Add Coupon',
      nameZh: 'Name (ZH)',
      nameEn: 'Name (EN)',
      threshold: 'Threshold',
      reductionValue: 'Reduction Value',
      stackable: 'Stackable',
      scope: 'Scope',
      allProducts: 'All Products',
      specificCategory: 'Specific Category',
      category: 'Category',
      couponCode: 'Coupon Code',
      type: 'Type',
      fixedAmount: 'Fixed Amount',
      percentage: 'Percentage',
      value: 'Value',
      minOrder: 'Min Order Value (Optional)',
      save: 'Save',
      cancel: 'Cancel',
      active: 'Active',
      inactive: 'Inactive',
      thresholdFormat: 'Spend $',
      reduceFormat: 'Get $ off',
      offFormat: '% OFF',
      minOrderFormat: 'Min Order: $',
      noMinOrder: 'No Min Order',
    }
  }[locale];
`;
  goodCode = goodCode.substring(0, dictStart) + replacementDict + goodCode.substring(dictEnd);
}

fs.writeFileSync('src/components/admin/AdminMarketing.tsx', goodCode);
