const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminUsers.tsx', 'utf8');

const targetRolesState = `const [roles, setRoles] = useState<any[]>([]);`;
const replaceRolesState = `const [roles, setRoles] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const allModules = ['orders', 'products', 'users', 'marketing', 'settings', 'content', 'manage_users'];`;

const targetFetchRoles = `const res = await apiFetch('/api/admin/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
      }`;
const replaceFetchRoles = `const res = await apiFetch('/api/admin/roles');
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles);
        const permMap: Record<string, string[]> = {};
        for (const role of data.roles) {
          const pRes = await apiFetch('/api/admin/roles/' + role.id + '/permissions');
          const pData = await pRes.json();
          permMap[role.id] = (pData.permissions || []).map((p: any) => p.module);
        }
        setRolePermissions(permMap);
      }`;

const targetHandleRolePerm = `const handleAddRole = async (e: React.FormEvent) => {`;
const replaceHandleRolePerm = `const handleRolePermissionToggle = async (roleId: string, module: string, checked: boolean) => {
    const current = rolePermissions[roleId] || [];
    const updated = checked ? [...current, module] : current.filter(m => m !== module);
    setRolePermissions({ ...rolePermissions, [roleId]: updated });
    await apiFetch('/api/admin/roles/' + roleId + '/permissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: updated })
    });
  };

  const handleAddRole = async (e: React.FormEvent) => {`;

const targetRolesUI = `<td className="p-4 text-right">
                      <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                    </td>`;
const replaceRolesUI = `<td className="p-4">
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        {allModules.map(mod => (
                          <label key={mod} className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(rolePermissions[r.id] || []).includes(mod)}
                              onChange={(e) => handleRolePermissionToggle(r.id, mod, e.target.checked)}
                              className="w-3 h-3 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
                            />
                            {mod}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteRole(r.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                    </td>`;

const targetRolesHeader = `<th className="p-4">Code</th>
                  <th className="p-4 text-right">Action</th>`;
const replaceRolesHeader = `<th className="p-4">Code</th>
                  <th className="p-4">Permissions</th>
                  <th className="p-4 text-right">Action</th>`;

code = code.replace(targetRolesState, replaceRolesState)
  .replace(targetFetchRoles, replaceFetchRoles)
  .replace(targetHandleRolePerm, replaceHandleRolePerm)
  .replace(targetRolesUI, replaceRolesUI)
  .replace(targetRolesHeader, replaceRolesHeader);

fs.writeFileSync('src/components/admin/AdminUsers.tsx', code);
