const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminUsers.tsx', 'utf8');

const permUI = `
  const handleUpdatePermissions = async (userId: string, module: string, checked: boolean, currentPerms: any) => {
    let newPerms = currentPerms ? [...currentPerms] : ['orders', 'products', 'users', 'settings'];
    if (checked && !newPerms.includes(module)) newPerms.push(module);
    if (!checked) newPerms = newPerms.filter((p: string) => p !== module);
    try {
      const res = await apiFetch('/api/admin/users/' + userId + '/permissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: newPerms })
      });
      if (res.ok) fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };
`;

if (!code.includes('handleUpdatePermissions')) {
  code = code.replace(
    /const handleUpdateRole = async/,
    permUI + '\n  const handleUpdateRole = async'
  );
  
  code = code.replace(
    /<th className="px-4 py-3">{locale === 'zh-HK' \? '角色權限' : 'Role'}<\/th>/,
    `<th className="px-4 py-3">{locale === 'zh-HK' ? '角色' : 'Role'}</th>\n              <th className="px-4 py-3">{locale === 'zh-HK' ? '管理模組' : 'Modules'}</th>`
  );
  
  const modulesCols = `
                <td className="px-4 py-3">
                  {user.role === 'admin' ? (
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {['orders', 'products', 'users', 'settings'].map(mod => {
                        const hasPerm = !user.permissions || user.permissions.includes(mod);
                        return (
                          <label key={mod} className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={hasPerm} 
                              onChange={(e) => handleUpdatePermissions(user.id, mod, e.target.checked, user.permissions)} 
                              className="w-3 h-3 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            {mod}
                          </label>
                        )
                      })}
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-400">-</span>
                  )}
                </td>
  `;
  
  code = code.replace(
    /<td className="px-4 py-3">\s*<select[\s\S]*?<\/select>\s*<\/td>/,
    `$&${modulesCols}`
  );
  
  fs.writeFileSync('src/components/admin/AdminUsers.tsx', code);
}
