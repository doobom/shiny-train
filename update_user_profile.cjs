const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

// Add Profile tab
if (!code.includes("id: 'profile'")) {
  code = code.replace(
    /const tabs = \[/,
    "const tabs = [\n    { id: 'profile', label: locale === 'zh-HK' ? '個人資料' : 'Profile' },"
  );
}

// Add state for profile editing
if (!code.includes("profileForm")) {
  code = code.replace(
    /const \[activeTab, setActiveTab\] = useState<\'orders\' \| \'tickets\' \| \'faqs\'>\(\'orders\'\);/,
    "const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'tickets' | 'faqs'>('profile');\n  const [profileForm, setProfileForm] = useState({ oldPassword: '', newPassword: '' });\n  const [profileMessage, setProfileMessage] = useState('');"
  );
}

// Add Profile Tab Content
if (!code.includes("activeTab === 'profile'")) {
  code = code.replace(
    /\{activeTab === 'orders' && \(/,
    `{activeTab === 'profile' && (
        <div className="bg-white p-5 rounded-xl border border-gray-150 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-950 font-display mb-1">{locale === 'zh-HK' ? '帳戶資料' : 'Account Details'}</h3>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '電郵地址' : 'Email'}</span>
                <span className="text-xs font-bold text-gray-900">{user?.email}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '會員等級' : 'Membership Tier'}</span>
                <span className="text-xs font-bold text-amber-600 uppercase">{(user as any)?.tier || 'STANDARD'}</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">{locale === 'zh-HK' ? '權限' : 'Role'}</span>
                <span className="text-xs font-bold text-emerald-600 uppercase">{(user as any)?.role || 'CUSTOMER'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-sm font-bold text-gray-950 font-display mb-4">{locale === 'zh-HK' ? '修改密碼' : 'Change Password'}</h3>
            {profileMessage && (
              <div className="mb-4 p-3 rounded-lg text-xs font-bold bg-neutral-100 text-neutral-800">
                {profileMessage}
              </div>
            )}
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const res = await fetch(\`\${import.meta.env.VITE_API_BASE_URL}/api/user/password\`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
                  body: JSON.stringify({ oldPassword: profileForm.oldPassword, newPassword: profileForm.newPassword })
                });
                const data = await res.json();
                if (data.success) {
                  setProfileMessage(locale === 'zh-HK' ? '密碼修改成功' : 'Password updated successfully');
                  setProfileForm({ oldPassword: '', newPassword: '' });
                } else {
                  setProfileMessage(data.message || 'Error updating password');
                }
              } catch (err) {
                setProfileMessage('Error updating password');
              }
            }} className="max-w-sm space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '目前密碼' : 'Current Password'}</label>
                <input
                  type="password"
                  required
                  value={profileForm.oldPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{locale === 'zh-HK' ? '新密碼' : 'New Password'}</label>
                <input
                  type="password"
                  required
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full border border-gray-250 p-2.5 rounded-lg text-xs mt-1 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
              >
                {locale === 'zh-HK' ? '儲存' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (`
  );
}

fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
