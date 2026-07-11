const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminUsers.tsx', 'utf8');

code = code.replace(/<span className=\{`inline-flex[\s\S]*?<\/span>/, 
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
