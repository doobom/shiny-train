const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace("import UserProfile from './components/shop/UserProfile.tsx';", "import UserProfile from './components/shop/UserProfile.tsx';\nimport AuthView from './components/shop/AuthView.tsx';");

code = code.replace(/  \/\/ Simulation user auth states[\s\S]*?\}, \[userId\]\);/g, `  // Authentication state
  const [userId, setUserId] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [tokenReady, setTokenReady] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserEmail = localStorage.getItem('user_email');
    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserEmail(storedUserEmail || '');
      setTokenReady(true);
    }
  }, []);

  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem('jwt_token', token);
    localStorage.setItem('user_id', user.id);
    localStorage.setItem('user_email', user.email);
    setUserId(user.id);
    setUserEmail(user.email);
    setTokenReady(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    setUserId('');
    setUserEmail('');
    setTokenReady(false);
    setCurrentView('shop_home');
  };`);

// Also add a logout button next to language toggle
code = code.replace(/            <button\n              onClick=\{toggleLanguage\}/g, `            {tokenReady && (
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-red-600 font-bold px-3 py-2 rounded-xl text-xs transition-colors flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{locale === 'zh-HK' ? '登出' : 'Logout'}</span>
              </button>
            )}
            <button
              onClick={toggleLanguage}`);

// Remove Simulation Persona Bar entirely
code = code.replace(/      \{\/\* Simulation Persona Bar \*\/\}[\s\S]*?\{\/\* Primary Header Section \*\/\}/g, "{/* Primary Header Section */}");

// Change main rendering block for !tokenReady
code = code.replace(/        \{!tokenReady \? \([\s\S]*?        \) : !isAdminMode \? \(/g, `        {!tokenReady ? (
          <AuthView onLoginSuccess={handleLoginSuccess} />
        ) : !isAdminMode ? (`);

fs.writeFileSync('src/App.tsx', code);
