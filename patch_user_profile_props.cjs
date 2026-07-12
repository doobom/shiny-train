const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const propsTarget = `interface UserProfileProps {
  userId: string;
  locale: Locale;
}

export default function UserProfile({ userId, locale }: UserProfileProps) {`;

const propsReplace = `interface UserProfileProps {
  userId: string;
  locale: Locale;
  onPayNow?: (orderId: string) => void;
}

export default function UserProfile({ userId, locale, onPayNow }: UserProfileProps) {`;
code = code.replace(propsTarget, propsReplace);

const buttonTarget = `                  {order.status === 'pending_payment' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="border border-red-200 hover:border-red-500 text-red-500 hover:text-red-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {dict.cancelOrder}
                    </button>
                  )}`;

const buttonReplace = `                  {order.status === 'pending_payment' && (
                    <>
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="border border-red-200 hover:border-red-500 text-red-500 hover:text-red-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {dict.cancelOrder}
                      </button>
                      <button
                        onClick={() => onPayNow && onPayNow(order.id)}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-[11px] font-bold px-4 py-1.5 rounded-lg transition-colors flex items-center shadow-sm"
                      >
                        {locale === 'zh-HK' ? '立即付款' : 'Pay Now'}
                      </button>
                    </>
                  )}`;
code = code.replace(buttonTarget, buttonReplace);

fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
