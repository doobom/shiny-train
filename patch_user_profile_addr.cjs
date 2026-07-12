const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const fetchTarget = `    if (activeTab === 'profile') {
      apiFetch('/api/user/profile', { headers: { Authorization: \`Bearer \${token}\` } })
        .then(res => res.json())
        .then(data => {
          if (data.address) {
            setProfileForm(p => ({
              ...p,
              addressRecipient: data.address.recipient || '',
              addressPhone: data.address.phone || '',
              addressDetail: data.address.detail || ''
            }));
          }
        });
    }`;

const fetchReplace = `    if (activeTab === 'profile') {
      fetchAddresses();
    }`;
code = code.replace(fetchTarget, fetchReplace);

const stateTarget = `  const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '', addressRecipient: '', addressPhone: '', addressDetail: '' });
  const [profileMessage, setProfileMessage] = useState('');`;

const stateReplace = `  const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '', addressRecipient: '', addressPhone: '', addressDetail: '' });
  const [profileMessage, setProfileMessage] = useState('');
  
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({ recipient: '', phone: '', detail: '', remark: '', isDefault: false });
  const [showAddressForm, setShowAddressForm] = useState(false);

  const fetchAddresses = () => {
    apiFetch('/api/user/addresses', { headers: { Authorization: \`Bearer \${token}\` } })
      .then(res => res.json())
      .then(data => setAddresses(data.addresses || []));
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingAddressId ? \`/api/user/addresses/\${editingAddressId}\` : '/api/user/addresses';
    const method = editingAddressId ? 'PUT' : 'POST';
    
    await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
      body: JSON.stringify(addressForm)
    });
    
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressForm({ recipient: '', phone: '', detail: '', remark: '', isDefault: false });
    fetchAddresses();
  };

  const handleDeleteAddress = async (id: string) => {
    await apiFetch(\`/api/user/addresses/\${id}\`, { method: 'DELETE', headers: { Authorization: \`Bearer \${token}\` } });
    fetchAddresses();
  };

  const handleSetDefaultAddress = async (id: string) => {
    const target = addresses.find(a => a.id === id);
    if (!target) return;
    await apiFetch(\`/api/user/addresses/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
      body: JSON.stringify({ ...target, isDefault: true })
    });
    fetchAddresses();
  };
`;
code = code.replace(stateTarget, stateReplace);

// We need to find the profile address form HTML.
const addressHtmlTarget = `            <form onSubmit={async (e) => {
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
            </form>`;

const addressHtmlReplace = `
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-gray-900">{locale === 'zh-HK' ? '收貨地址管理' : 'Shipping Addresses'}</h4>
                {!showAddressForm && (
                  <button onClick={() => { setEditingAddressId(null); setAddressForm({ recipient: '', phone: '', detail: '', remark: '', isDefault: false }); setShowAddressForm(true); }} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                    + {locale === 'zh-HK' ? '新增地址' : 'Add New'}
                  </button>
                )}
              </div>
              
              {!showAddressForm ? (
                <div className="space-y-3">
                  {addresses.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">{locale === 'zh-HK' ? '尚未添加地址' : 'No addresses added yet.'}</p>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className="border border-gray-200 p-3 rounded-lg relative hover:border-gray-300 transition-colors">
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 bg-neutral-900 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {locale === 'zh-HK' ? '默認' : 'Default'}
                          </span>
                        )}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-gray-900">{addr.recipient} <span className="text-gray-500 text-xs font-normal ml-2">{addr.phone}</span></p>
                            <p className="text-xs text-gray-700">{addr.detail}</p>
                            {addr.remark && <p className="text-[10px] text-gray-500 bg-gray-50 p-1 rounded inline-block mt-1">📝 {addr.remark}</p>}
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button onClick={() => {
                            setEditingAddressId(addr.id);
                            setAddressForm({ recipient: addr.recipient, phone: addr.phone, detail: addr.detail, remark: addr.remark || '', isDefault: addr.isDefault });
                            setShowAddressForm(true);
                          }} className="text-xs text-amber-600 font-bold hover:underline">
                            {locale === 'zh-HK' ? '編輯' : 'Edit'}
                          </button>
                          <div className="flex gap-3">
                            {!addr.isDefault && (
                              <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-[10px] text-gray-500 hover:text-gray-900 font-medium">
                                {locale === 'zh-HK' ? '設為默認' : 'Set as Default'}
                              </button>
                            )}
                            <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] text-red-500 hover:text-red-700 font-medium">
                              {locale === 'zh-HK' ? '刪除' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <form onSubmit={handleSaveAddress} className="max-w-sm space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '收貨人姓名' : 'Recipient Name'}</label>
                    <input type="text" required value={addressForm.recipient} onChange={e => setAddressForm(p => ({...p, recipient: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '聯絡電話' : 'Phone'}</label>
                    <input type="text" required value={addressForm.phone} onChange={e => setAddressForm(p => ({...p, phone: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '詳細地址' : 'Address'}</label>
                    <textarea rows={3} required value={addressForm.detail} onChange={e => setAddressForm(p => ({...p, detail: e.target.value}))} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '地址備註 (可選)' : 'Remark (Optional)'}</label>
                    <input type="text" value={addressForm.remark} onChange={e => setAddressForm(p => ({...p, remark: e.target.value}))} placeholder={locale === 'zh-HK' ? '例如：公司、家' : 'e.g. Home, Office'} className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isDefault" checked={addressForm.isDefault} onChange={e => setAddressForm(p => ({...p, isDefault: e.target.checked}))} className="rounded" />
                    <label htmlFor="isDefault" className="text-xs text-gray-700">{locale === 'zh-HK' ? '設為默認地址' : 'Set as default address'}</label>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button type="submit" className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition-colors">
                      {locale === 'zh-HK' ? '儲存' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold px-4 py-2.5 rounded-lg text-xs transition-colors">
                      {locale === 'zh-HK' ? '取消' : 'Cancel'}
                    </button>
                  </div>
                </form>
              )}
            </div>
`;
code = code.replace(addressHtmlTarget, addressHtmlReplace);

fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
