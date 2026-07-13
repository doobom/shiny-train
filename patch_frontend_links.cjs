const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const adminButtonTarget = `{tokenReady && JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin' && !isAdminMode && (
              <button
                onClick={() => setIsAdminMode(true)}
                className="font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-500 hover:text-gray-950"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{dict.adminConsole}</span>
              </button>
            )}`;

const adminButtonReplace = `{tokenReady && JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin' && !isAdminMode && (
              import.meta.env.VITE_B_FRONTEND_URL ? (
                <a
                  href={import.meta.env.VITE_B_FRONTEND_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-500 hover:text-gray-950"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.adminConsole}</span>
                </a>
              ) : (
                <button
                  onClick={() => setIsAdminMode(true)}
                  className="font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-500 hover:text-gray-950"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">{dict.adminConsole}</span>
                </button>
              )
            )}`;

code = code.replace(adminButtonTarget, adminButtonReplace);

const adminTitleTarget = `<div className="border-b pb-3.5 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Administrator Drawer</span>
                <h3 className="text-sm font-black text-gray-950 mt-1 font-display flex items-center gap-1">
                  <Shield className="h-4 w-4 text-amber-500" />
                  {dict.adminConsole}
                </h3>
              </div>`;

const adminTitleReplace = `<div className="border-b pb-3.5 mb-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Administrator Drawer</span>
                {import.meta.env.VITE_C_FRONTEND_URL ? (
                  <a href={import.meta.env.VITE_C_FRONTEND_URL} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-gray-950 mt-1 font-display flex items-center gap-1 hover:underline">
                    <Shield className="h-4 w-4 text-amber-500" />
                    {dict.adminConsole}
                  </a>
                ) : (
                  <h3 className="text-sm font-black text-gray-950 mt-1 font-display flex items-center gap-1">
                    <Shield className="h-4 w-4 text-amber-500" />
                    {dict.adminConsole}
                  </h3>
                )}
              </div>`;

code = code.replace(adminTitleTarget, adminTitleReplace);

fs.writeFileSync('src/App.tsx', code);
