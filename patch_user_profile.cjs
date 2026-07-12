const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const target = `<span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold \${
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'
                    }\`}>
                      {order.status.toUpperCase()}
                    </span>`;

const replace = `<span className={\`px-2.5 py-0.5 rounded-full text-[10px] font-bold \${
                      order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'cancelled' ? 'bg-gray-100 text-gray-600' : 'bg-amber-50 text-amber-700'
                    }\`}>
                      {order.status.toUpperCase()}
                    </span>
                    {(order.status === 'completed' || order.status === 'paid' || order.status === 'shipped') && (
                      <button onClick={() => downloadReceipt(order.id)} className="text-[10px] font-bold text-neutral-600 hover:text-neutral-900 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">
                        {locale === 'zh-HK' ? '下載收據' : 'Receipt'}
                      </button>
                    )}`;

code = code.replace(target, replace);
fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
