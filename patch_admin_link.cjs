const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetState = `const [isAdminMode, setIsAdminMode] = useState<boolean>(appMode === 'admin');`;
const replaceState = `const [isAdminMode, setIsAdminMode] = useState<boolean>(appMode === 'admin' || window.location.search.includes('mode=admin'));`;

const targetBtn = `<button 
              onClick={() => setIsAdminMode(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
              {locale === 'zh-HK' ? '管理員控制台' : 'Admin Console'}
            </button>`;

const replaceBtn = `<button 
              onClick={() => window.open('/?mode=admin', '_blank')}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Shield className="h-4 w-4" />
              {locale === 'zh-HK' ? '管理員控制台' : 'Admin Console'}
            </button>`;

code = code.replace(targetState, replaceState).replace(targetBtn, replaceBtn);
fs.writeFileSync('src/App.tsx', code);
