const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminMarketing.tsx', 'utf8');

const dictCode = `
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
      addSuccess: '添加成功',
      fillRequired: '請填寫所有必填欄位',
      error: '發生錯誤'
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
      addSuccess: 'Successfully added',
      fillRequired: 'Please fill all required fields',
      error: 'An error occurred'
    }
  }[locale];
`;

code = code.replace(
  `export default function AdminMarketing({ locale }: AdminMarketingProps) {\n  const [activeTab, setActiveTab] = useState<'reductions' | 'coupons'>('reductions');`,
  `export default function AdminMarketing({ locale }: AdminMarketingProps) {\n${dictCode}\n  const [activeTab, setActiveTab] = useState<'reductions' | 'coupons'>('reductions');`
);

code = code.replace(/>滿減活動</g, '>{dict.reductionsTab}<');
code = code.replace(/>優惠碼</g, '>{dict.couponsTab}<');
code = code.replace(/>添加滿減</g, '>{dict.addReduction}<');
code = code.replace(/>添加優惠碼</g, '>{dict.addCoupon}<');
code = code.replace(/>中文名稱</g, '>{dict.nameZh}<');
code = code.replace(/>英文名稱</g, '>{dict.nameEn}<');
code = code.replace(/>門檻金額</g, '>{dict.threshold}<');
code = code.replace(/>減免金額</g, '>{dict.reductionValue}<');
code = code.replace(/>可疊加使用</g, '>{dict.stackable}<');
code = code.replace(/>適用範圍</g, '>{dict.scope}<');
code = code.replace(/>所有商品</g, '>{dict.allProducts}<');
code = code.replace(/>特定分類</g, '>{dict.specificCategory}<');
code = code.replace(/>分類</g, '>{dict.category}<');
code = code.replace(/>類型</g, '>{dict.type}<');
code = code.replace(/>固定金額</g, '>{dict.fixedAmount}<');
code = code.replace(/>百分比折扣</g, '>{dict.percentage}<');
code = code.replace(/>折扣數值</g, '>{dict.value}<');
code = code.replace(/>最低訂單金額 \(選填\)</g, '>{dict.minOrder}<');
code = code.replace(/>儲存</g, '>{dict.save}<');
code = code.replace(/>取消</g, '>{dict.cancel}<');
code = code.replace(/>啟用中</g, '>{dict.active}<');
code = code.replace(/>已停用</g, '>{dict.inactive}<');
code = code.replace(/>滿 \\$/g, '>{dict.thresholdFormat}');
code = code.replace(/>減 \\$/g, '>{dict.reduceFormat}');
code = code.replace(/>無門檻</g, '>{dict.noMinOrder}<');
code = code.replace(/最低訂單: \\$/g, '{dict.minOrderFormat}');

fs.writeFileSync('src/components/admin/AdminMarketing.tsx', code);
