const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserEmail = localStorage.getItem('user_email');
    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserEmail(storedUserEmail || '');
      setTokenReady(true);
    }
  }, []);`;

const replaceStr = `  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUserId = localStorage.getItem('user_id');
    const storedUserEmail = localStorage.getItem('user_email');
    if (token && storedUserId) {
      setUserId(storedUserId);
      setUserEmail(storedUserEmail || '');
      setTokenReady(true);
    }

    const handleAuthError = () => {
      setTokenReady(false);
      setUserId('');
      setUserEmail('');
      setCurrentView('auth');
    };
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);`;

code = code.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', code);
