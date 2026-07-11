const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

if (!code.includes('addressRecipient')) {
  code = code.replace(/const \[profileForm, setProfileForm\] = useState\(\{ oldPassword: '', newPassword: '' \}\);/,
  `const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '', addressRecipient: '', addressPhone: '', addressDetail: '' });`);
  
  code = code.replace(/fetch\('\/api\/faqs', \{ headers: \{ Authorization: \`Bearer \$\{token\}\` \} \}\)\.then\(res => res\.json\(\)\)\n    \]\)\n    \.then\(\(\[ordersData, ticketsData, faqsData\]\) => \{/,
  `fetch('/api/faqs', { headers: { Authorization: \`Bearer \${token}\` } }).then(res => res.json()),
      apiFetch('/api/user/profile').then(res => res.json())
    ])
    .then(([ordersData, ticketsData, faqsData, userData]) => {
      if (userData?.user) {
        setProfileForm(prev => ({ ...prev, addressRecipient: userData.user.addressRecipient || '', addressPhone: userData.user.addressPhone || '', addressDetail: userData.user.addressDetail || '' }));
      }
  `);

  code = code.replace(/<div className="bg-gray-50 p-3 rounded-lg border border-gray-100">\s*<span className="text-\[10px\] text-gray-400 uppercase font-semibold block">\{locale === 'zh-HK' \? '權限' : 'Role'\}<\/span>\s*<span className="text-xs font-bold text-emerald-600 uppercase">\{\(user as any\)\?\.role \|\| 'CUSTOMER'\}<\/span>\s*<\/div>/,
  `
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '權限' : 'Role'}</span>
                <span className="text-xs font-bold text-emerald-600 uppercase">{(user as any)?.role || 'CUSTOMER'}</span>
              </div>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await apiFetch('/api/user/profile', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ addressRecipient: profileForm.addressRecipient, addressPhone: profileForm.addressPhone, addressDetail: profileForm.addressDetail })
                });
                const data = await res.json();
                if (data.success) {
                  setProfileMessage(locale === 'zh-HK' ? '資料更新成功' : 'Profile updated successfully');
                }
              } catch (err) {}
            }} className="max-w-sm space-y-4 mt-6">
              <h4 className="text-xs font-bold text-gray-900">{locale === 'zh-HK' ? '收貨資料' : 'Shipping Details'}</h4>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '收貨人姓名' : 'Recipient Name'}</label>
                <input type="text" value={profileForm.addressRecipient} onChange={e => setProfileForm(p => ({...p, addressRecipient: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '聯絡電話' : 'Phone'}</label>
                <input type="text" value={profileForm.addressPhone} onChange={e => setProfileForm(p => ({...p, addressPhone: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '詳細地址' : 'Address'}</label>
                <textarea rows={3} value={profileForm.addressDetail} onChange={e => setProfileForm(p => ({...p, addressDetail: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
              </div>
              <button type="submit" className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors">
                {locale === 'zh-HK' ? '儲存資料' : 'Save Profile'}
              </button>
            </form>
            `);

  fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
}
