import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Edit, Trash2 } from 'lucide-react';
import { fetchWithAuth as apiFetch } from '../../utils/api';

export default function AdminUsers({ locale }: { locale: 'zh-HK' | 'en' }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
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

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200">
            <tr>
              <th className="px-4 py-3">{locale === 'zh-HK' ? '用戶' : 'User'}</th>
              <th className="px-4 py-3">{locale === 'zh-HK' ? '角色權限' : 'Role'}</th>
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
                  <select
                    className={`text-[10px] font-bold uppercase tracking-wider border rounded-lg p-1 ${user.tier === 'vip' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    value={user.tier}
                    onChange={(e) => handleUpdateTier(user.id, e.target.value)}
                  >
                    <option value="standard">Standard</option>
                    <option value="vip">VIP</option>
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
    </div>
  );
}
