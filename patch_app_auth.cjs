const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setTokenReady(true);
    }
  }, []);`;

const replaceStr = `  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setTokenReady(true);
    }
    
    const handleAuthError = () => {
      setTokenReady(false);
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', code);
