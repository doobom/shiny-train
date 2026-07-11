const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const handleLoginSuccess = \(token: string, user: any\) => \{[\s\S]*?setTokenReady\(true\);\n  \};/,
`const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('token', token); // For UserProfile
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_email', user.email);
    localStorage.setItem('user', JSON.stringify(user));
    setUserId(user.id);
    setUserEmail(user.email);
    setTokenReady(true);
    
    // Automatically switch to admin mode if the user is an admin and appMode isn't strictly 'user'
    if (user.role === 'admin' && appMode !== 'user') {
      setIsAdminMode(true);
    }
  };`);

// Also add a button for admin console if user is admin
const adminBtn = `{tokenReady && JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin' && !isAdminMode && (
              <button
                onClick={() => setIsAdminMode(true)}
                className="font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-gray-500 hover:text-gray-950"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{dict.adminConsole}</span>
              </button>
            )}`;

code = code.replace(/<button\s+onClick=\{toggleLanguage\}/, adminBtn + '\n            <button\n              onClick={toggleLanguage}');

// Make sure to import Shield
if (!code.includes('Shield,')) {
  code = code.replace(/import \{ /, 'import { Shield, ');
}

fs.writeFileSync('src/App.tsx', code);
