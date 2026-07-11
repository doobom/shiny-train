const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

if (!code.includes('const [newEmail, setNewEmail] = useState')) {
  code = code.replace(
    /const \[user, setUser\] = useState<any>\(null\);/,
    "const [user, setUser] = useState<any>(null);\n  const [newEmail, setNewEmail] = useState('');\n  const [emailMsg, setEmailMsg] = useState('');"
  );
  
  const emailForm = `
            <form onSubmit={async (e) => {
              e.preventDefault();
              setEmailMsg('');
              const res = await apiFetch('/api/auth/profile/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newEmail })
              });
              const data = await res.json();
              if (data.success) {
                setUser({ ...user, email: data.email });
                setNewEmail('');
                setEmailMsg('Email updated successfully');
              } else {
                setEmailMsg(data.message || 'Failed to update email');
              }
            }} className="mt-6 border-t pt-4">
              <h4 className="text-xs font-bold text-gray-900 mb-2">{locale === 'zh-HK' ? '修改電郵' : 'Change Email'}</h4>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  placeholder={locale === 'zh-HK' ? '新電郵地址' : 'New Email Address'} 
                  className="flex-1 text-xs border border-gray-250 p-2 rounded-lg"
                />
                <button type="submit" className="bg-neutral-900 text-white text-xs px-4 py-2 rounded-lg font-bold">
                  {locale === 'zh-HK' ? '更新' : 'Update'}
                </button>
              </div>
              {emailMsg && <p className="text-[10px] text-gray-500 mt-1">{emailMsg}</p>}
            </form>
  `;
  
  code = code.replace(
    /<form onSubmit=\{async \(e\) => \{/,
    emailForm + '\n            <form onSubmit={async (e) => {'
  );
  fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
}
