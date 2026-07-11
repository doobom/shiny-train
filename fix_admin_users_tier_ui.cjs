const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminUsers.tsx', 'utf8');

if (!code.includes('handleUpdateTier')) {
  code = code.replace(
    /const handleUpdateRole = async[\s\S]*?console\.error\(e\);\n    \}\n  \};/,
    `$&
  const handleUpdateTier = async (userId: string, newTier: string) => {
    try {
      const res = await apiFetch('/api/admin/users/' + userId + '/tier', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };`
  );
  
  code = code.replace(
    /<span className=\{`inline-flex items-center px-2 py-0\.5 rounded-full text-\[10px\] font-bold uppercase tracking-wider \$\{user\.tier === 'vip' \? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'\}`\}>\s*\{user\.tier\}\s*<\/span>/,
    `<select
                    className={\`text-[10px] font-bold uppercase tracking-wider border rounded-lg p-1 \${user.tier === 'vip' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}\`}
                    value={user.tier}
                    onChange={(e) => handleUpdateTier(user.id, e.target.value)}
                  >
                    <option value="standard">Standard</option>
                    <option value="vip">VIP</option>
                  </select>`
  );
  fs.writeFileSync('src/components/admin/AdminUsers.tsx', code);
}
