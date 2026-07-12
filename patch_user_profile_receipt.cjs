const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const targetStr = `                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {/* Sub items snapshot list */}`;

const replaceStr = `                      {order.status.toUpperCase()}
                    </span>
                    {order.status !== 'pending_payment' && order.status !== 'cancelled' && (
                      <button onClick={() => downloadReceipt(order.id)} className="ml-2 px-2.5 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-[10px] font-bold">
                        {locale === 'zh-HK' ? '下載收據' : 'Receipt'}
                      </button>
                    )}
                  </div>
                </div>
                {/* Sub items snapshot list */}`;

code = code.replace(targetStr, replaceStr);

const importTarget = `import { Locale, Order, Feedback, FAQ } from '../../types/index.ts';`;
const importReplace = `import { Locale, Order, Feedback, FAQ } from '../../types/index.ts';\nimport jsPDF from 'jspdf';\nimport html2canvas from 'html2canvas';`;

code = code.replace(importTarget, importReplace);

const fnTarget = `const [faqs, setFaqs] = useState<FAQ[]>([]);`;
const fnReplace = `const [faqs, setFaqs] = useState<FAQ[]>([]);
  const downloadReceipt = async (orderId: string) => {
    try {
      const res = await apiFetch('/api/orders/' + orderId + '/receipt');
      const data = await res.json();
      if (!data.success) return;
      
      const r = data.receipt;
      const receiptDiv = document.createElement('div');
      receiptDiv.style.width = '400px';
      receiptDiv.style.padding = '20px';
      receiptDiv.style.background = '#fff';
      receiptDiv.style.color = '#000';
      receiptDiv.style.fontFamily = 'sans-serif';
      receiptDiv.innerHTML = \`
        <h2 style="text-align: center; margin-bottom: 5px;">\${r.company}</h2>
        <p style="text-align: center; font-size: 10px; margin-top: 0;">BRN: \${r.taxId}</p>
        <hr/>
        <p><strong>Order No:</strong> \${r.orderNo}</p>
        <p><strong>Date:</strong> \${new Date(r.date).toLocaleString()}</p>
        <p><strong>Customer:</strong> \${r.customerName}</p>
        <hr/>
        <table style="width: 100%; font-size: 12px;">
          <tr><th style="text-align:left">Item</th><th>Qty</th><th style="text-align:right">Price</th></tr>
          \${r.items.map((i:any) => \`<tr><td>\${i.skuId}</td><td style="text-align:center">\${i.qty}</td><td style="text-align:right">HK$\${(i.unitPrice/100).toFixed(2)}</td></tr>\`).join('')}
        </table>
        <hr/>
        <p style="text-align: right; margin: 5px 0;">Subtotal: HK$\${(r.subtotal/100).toFixed(2)}</p>
        <p style="text-align: right; margin: 5px 0;">Shipping: HK$\${(r.shippingFee/100).toFixed(2)}</p>
        <p style="text-align: right; margin: 5px 0;">Discount: -HK$\${(r.discount/100).toFixed(2)}</p>
        <h3 style="text-align: right; margin: 10px 0;">Total: HK$\${(r.grandTotal/100).toFixed(2)}</h3>
        <p style="text-align: center; font-size: 10px; margin-top: 20px;">Thank you for your purchase!</p>
      \`;
      document.body.appendChild(receiptDiv);
      
      const canvas = await html2canvas(receiptDiv);
      document.body.removeChild(receiptDiv);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(\`Receipt_\${orderId}.pdf\`);
    } catch(e) {
      console.error('Failed to generate receipt', e);
    }
  };`;

code = code.replace(fnTarget, fnReplace);
fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
