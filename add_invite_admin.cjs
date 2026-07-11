const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminUsers.tsx', 'utf8');

const inviteUI = `
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  
  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/admin/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });
      const data = await res.json();
      if (data.success) {
        setShowInvite(false);
        setInviteEmail('');
        fetchUsers();
        alert('Admin invited successfully with default password "Admin123!"');
      } else {
        alert(data.message || 'Failed to invite');
      }
    } catch (e) {
      console.error(e);
    }
  };
`;

if (!code.includes('handleInviteAdmin')) {
  code = code.replace(
    /const handleUpdatePermissions = async/,
    inviteUI + '\n  const handleUpdatePermissions = async'
  );
  
  const buttonUI = `
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-950 font-display tracking-tight flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            {locale === 'zh-HK' ? '用戶權限管理' : 'User Role Management'}
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {locale === 'zh-HK' ? '管理系統用戶的權限與會員等級' : 'Manage system users roles and membership tiers'}
          </p>
        </div>
        <button onClick={() => setShowInvite(true)} className="bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg">
          + {locale === 'zh-HK' ? '邀請管理員' : 'Invite Admin'}
        </button>
      </div>
      
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 max-w-[90%]">
            <h3 className="text-lg font-bold mb-4">{locale === 'zh-HK' ? '邀請管理員' : 'Invite Admin'}</h3>
            <form onSubmit={handleInviteAdmin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email</label>
                  <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="w-full border p-2 rounded-lg text-xs" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setShowInvite(false)} className="px-4 py-2 text-xs font-bold text-gray-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold bg-neutral-900 text-white rounded-lg">Invite</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
  `;
  
  code = code.replace(
    /<div className="flex items-center justify-between mb-6">[\s\S]*?<\/div>/,
    buttonUI
  );
  
  fs.writeFileSync('src/components/admin/AdminUsers.tsx', code);
}
