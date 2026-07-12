const fs = require('fs');
let code = fs.readFileSync('src/components/shop/CheckoutView.tsx', 'utf8');

const targetStr1 = `  const [remark, setRemark] = useState('');
  const [preview, setPreview] = useState<any>(null);`;

const replaceStr1 = `  const [remark, setRemark] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [preview, setPreview] = useState<any>(null);`;

code = code.replace(targetStr1, replaceStr1);

const targetStr2 = `body: JSON.stringify({ items: payload })`;
const replaceStr2 = `body: JSON.stringify({ items: payload, promoCode: promoCode ? promoCode : undefined })`;
code = code.replace(targetStr2, replaceStr2);

const targetStr3 = `      items: cartItems.map((c: any) => ({ skuId: c.skuId, qty: c.qty })),
      address: {`;
const replaceStr3 = `      items: cartItems.map((c: any) => ({ skuId: c.skuId, qty: c.qty })),
      promoCode: promoCode ? promoCode : undefined,
      address: {`;
code = code.replace(targetStr3, replaceStr3);

const targetStr4 = `const handleUpdateAddress = () => {`;
const replaceStr4 = `const handleApplyPromo = () => {
    setSubmitting(true);
    setErr(null);
    const payload = cartItems.map((c: any) => ({ skuId: c.skuId, qty: c.qty }));
    apiFetch('/api/checkout/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload, promoCode })
    })
    .then(res => res.json())
    .then(previewData => {
      setSubmitting(false);
      if (previewData.code || previewData.error) {
        setErr(previewData.message || previewData.error);
      } else {
        setPreview(previewData);
      }
    })
    .catch(e => {
      setSubmitting(false);
      console.error(e);
    });
  };

  const handleUpdateAddress = () => {`;
code = code.replace(targetStr4, replaceStr4);

const targetStr5 = `            <textarea 
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder={locale === 'zh-HK' ? '例如：請在下午配送' : 'e.g. Please deliver in the afternoon'}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-neutral-900 outline-none"
              rows={2}
            />
          </div>`;

const replaceStr5 = `            <textarea 
              value={remark}
              onChange={e => setRemark(e.target.value)}
              placeholder={locale === 'zh-HK' ? '例如：請在下午配送' : 'e.g. Please deliver in the afternoon'}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-neutral-900 outline-none"
              rows={2}
            />
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-950 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              {locale === 'zh-HK' ? '優惠碼' : 'Promo Code'}
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                placeholder={locale === 'zh-HK' ? '輸入優惠碼' : 'Enter code'}
                className="flex-1 border border-gray-200 rounded-xl p-3 text-sm font-medium uppercase focus:border-neutral-900 outline-none"
              />
              <button 
                onClick={handleApplyPromo}
                disabled={submitting || !promoCode}
                className="bg-neutral-900 text-white px-5 py-3 rounded-xl text-sm font-bold disabled:opacity-50"
              >
                {locale === 'zh-HK' ? '套用' : 'Apply'}
              </button>
            </div>
          </div>`;

const targetStr6 = `import { CreditCard, Truck, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';`;
const replaceStr6 = `import { CreditCard, Truck, ChevronRight, MessageSquare, AlertCircle, Tag } from 'lucide-react';`;

code = code.replace(targetStr5, replaceStr5);
code = code.replace(targetStr6, replaceStr6);

fs.writeFileSync('src/components/shop/CheckoutView.tsx', code);
