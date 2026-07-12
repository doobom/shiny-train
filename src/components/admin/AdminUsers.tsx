import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Edit, Trash2, Layers } from 'lucide-react';
import { fetchWithAuth as apiFetch } from '../../utils/api';

export default function AdminUsers({ locale }: { locale: 'zh-HK' | 'en' }) {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'tiers'>('users');

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const allModules = ['orders', 'products', 'users', 'marketing', 'settings', 'content', 'manage_users'];
  const [tiers, setTiers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchTiers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiFetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiFetch('/api/admin/roles');
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
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTiers = async () => {
    try {
      const res = await apiFetch('/api/admin/tiers');
      const data = await res.json();
      if (data.success) {
        setTiers(data.tiers);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await apiFetch('/api/admin/users/' + userId + '/role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchUsers();
      }
    } catch (e) {
      console.error(e);
    }
  };

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
  };

  const [newTier, setNewTier] = useState({ tier: '', nameZh: '', nameEn: '', minSpendCents: 0, discountPercent: 0 });
  const handleAddTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTier)
      });
      setNewTier({ tier: '', nameZh: '', nameEn: '', minSpendCents: 0, discountPercent: 0 });
      fetchTiers();
    } catch(e) { console.error(e); }
  };
  const handleDeleteTier = async (id: string) => {
    if (!confirm('Delete this tier?')) return;
    try {
      await apiFetch('/api/admin/tiers/' + id, { method: 'DELETE' });
      fetchTiers();
    } catch(e) { console.error(e); }
  };

  const [newRole, setNewRole] = useState({ code: '' });
  const handleRolePermissionToggle = async (roleId: string, module: string, checked: boolean) => {
    const current = rolePermissions[roleId] || [];
    const updated = checked ? [...current, module] : current.filter(m => m !== module);
    setRolePermissions({ ...rolePermissions, [roleId]: updated });
    await apiFetch('/api/admin/roles/' + roleId + '/permissions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions: updated })
    });
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole)
      });
      setNewRole({ code: '' });
      fetchRoles();
    } catch(e) { console.error(e); }
  };
  const handleDeleteRole = async (id: string) => {
    if (!confirm('Delete this role?')) return;
    try {
      await apiFetch('/api/admin/roles/' + id, { method: 'DELETE' });
      fetchRoles();
    } catch(e) { console.error(e); }
  };

  if (loading) return <div className="p-8 text-center text-sm font-bold text-gray-500">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
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
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'users' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <User className="inline-block w-3.5 h-3.5 mr-1" /> {locale === 'zh-HK' ? '用戶管理' : 'Users'}
        </button>
        <button 
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'roles' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Shield className="inline-block w-3.5 h-3.5 mr-1" /> {locale === 'zh-HK' ? '角色設置' : 'Roles'}
        </button>
        <button 
          onClick={() => setActiveTab('tiers')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'tiers' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          <Layers className="inline-block w-3.5 h-3.5 mr-1" /> {locale === 'zh-HK' ? '會員等級' : 'Member Tiers'}
        </button>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
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
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">{locale === 'zh-HK' ? '用戶' : 'User'}</th>
                  <th className="px-4 py-3">{locale === 'zh-HK' ? '角色' : 'Role'}</th>
                  <th className="px-4 py-3">{locale === 'zh-HK' ? '管理模組' : 'Modules'}</th>
                  <th className="px-4 py-3">{locale === 'zh-HK' ? '會員等級' : 'Tier'}</th>
                  <th className="px-4 py-3 text-right">{locale === 'zh-HK' ? '操作' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs">{user.email}</div>
                          <div className="text-[10px] text-gray-500">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className="text-xs font-bold border border-gray-250 rounded-lg p-1.5 bg-white"
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
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
                      <td className="px-4 py-3">
                      <select
                        className={`text-[10px] font-bold uppercase tracking-wider border rounded-lg p-1 ${user.tier === 'vip' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                        value={user.tier}
                        onChange={(e) => handleUpdateTier(user.id, e.target.value)}
                      >
                        <option value="standard">Standard</option>
                        {tiers.map(t => (
                          <option key={t.id} value={t.tier}>{t.tier}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-neutral-400 hover:text-neutral-900 transition-colors p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <form onSubmit={handleAddRole} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-end">
            <div className="space-y-1 flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Role Code (e.g. manager)</label>
              <input type="text" required value={newRole.code} onChange={e=>setNewRole({code: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <button type="submit" className="bg-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg h-10">Add Role</button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase">
                  <th className="p-4">Code</th>
                  <th className="p-4">Permissions</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {roles.map(r => (
                  <tr key={r.id}>
                    <td className="p-4">{r.code}</td>
                    <td className="p-4">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className="space-y-4">
          <form onSubmit={handleAddTier} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3 items-end flex-wrap">
            <div className="space-y-1 flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Tier Code</label>
              <input type="text" required value={newTier.tier} onChange={e=>setNewTier({...newTier, tier: e.target.value})} placeholder="e.g. vip, vvip" className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <div className="space-y-1 flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Name (ZH)</label>
              <input type="text" value={newTier.nameZh} onChange={e=>setNewTier({...newTier, nameZh: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <div className="space-y-1 flex-1 min-w-[150px]">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Name (EN)</label>
              <input type="text" value={newTier.nameEn} onChange={e=>setNewTier({...newTier, nameEn: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <div className="space-y-1 w-24">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Min Spend (HK$)</label>
              <input type="number" value={newTier.minSpendCents / 100} onChange={e=>setNewTier({...newTier, minSpendCents: Math.round(Number(e.target.value)*100)})} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <div className="space-y-1 w-24">
              <label className="text-[10px] font-bold text-gray-500 uppercase block">Discount %</label>
              <input type="number" value={newTier.discountPercent} onChange={e=>setNewTier({...newTier, discountPercent: Number(e.target.value)})} className="w-full border border-gray-200 p-2.5 rounded-lg text-xs" />
            </div>
            <button type="submit" className="bg-gray-900 text-white font-bold text-xs px-5 py-2.5 rounded-lg h-10">Add</button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold uppercase">
                  <th className="p-4">Tier Code</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Min Spend</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {tiers.map(t => (
                  <tr key={t.id}>
                    <td className="p-4 uppercase">{t.tier}</td>
                    <td className="p-4">{t.nameZh} / {t.nameEn}</td>
                    <td className="p-4 text-amber-600 font-bold">HK${(t.minSpendCents / 100).toFixed(2)}</td>
                    <td className="p-4">{t.discountPercent}% OFF</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteTier(t.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
