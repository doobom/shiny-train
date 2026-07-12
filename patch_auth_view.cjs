const fs = require('fs');
let code = fs.readFileSync('src/components/shop/AuthView.tsx', 'utf8');

const targetState = `  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');`;

const replaceState = `  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');`;

code = code.replace(targetState, replaceState);

const targetSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');`;

const replaceSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    
    if (isForgot) {
      try {
        const res = await apiFetch('/api/auth/password/forgot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.success) {
          setMsg(data.message || 'Reset link sent to your email.');
        } else {
          setError(data.message || 'Failed to send reset link.');
        }
      } catch (err) {
        setError('Network error');
      }
      return;
    }`;

code = code.replace(targetSubmit, replaceSubmit);

const targetUI = `          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full bg-neutral-950 text-white font-bold py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {isLogin ? 'Sign In Securely' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-gray-500 hover:text-neutral-900 transition-colors"
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>`;

const replaceUI = `          </div>
          {!isForgot && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-gray-700">Password</label>
                {isLogin && (
                  <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] text-amber-600 font-bold hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required={!isForgot}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" 
                placeholder="••••••••"
              />
            </div>
          )}
          
          <button 
            type="submit"
            className="w-full bg-neutral-950 text-white font-bold py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
          >
            {isForgot ? 'Send Reset Link' : (isLogin ? 'Sign In Securely' : 'Create Account')}
          </button>
        </form>
        
        {msg && <div className="mt-4 p-3 bg-green-50 text-green-700 text-xs rounded-lg">{msg}</div>}
        
        <div className="mt-6 text-center space-y-2 flex flex-col">
          {isForgot && (
            <button 
              onClick={() => setIsForgot(false)}
              className="text-xs font-bold text-gray-500 hover:text-neutral-900 transition-colors"
            >
              Back to Login
            </button>
          )}
          {!isForgot && (
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-gray-500 hover:text-neutral-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          )}
        </div>`;

code = code.replace(targetUI, replaceUI);
fs.writeFileSync('src/components/shop/AuthView.tsx', code);
