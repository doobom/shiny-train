const fs = require('fs');
let code = fs.readFileSync('src/components/shop/AuthView.tsx', 'utf8');

const target = `<h2 className="text-xl font-bold mb-6 text-center">{isLogin ? 'Login to your account' : 'Create an account'}</h2>`;
const replace = `<h2 className="text-xl font-bold mb-6 text-center">
          {isForgot ? 'Reset Password' : isLogin ? 'Login to your account' : 'Create an account'}
        </h2>`;

const target2 = `<div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>`;
const replace2 = `{!isForgot && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>`;

const target3 = `onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="••••••••"
            />
          </div>`;
const replace3 = `onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="••••••••"
            />
          </div>
          )}`;

const target4 = `<button type="submit" className="w-full bg-neutral-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>`;
const replace4 = `<button type="submit" className="w-full bg-neutral-900 text-white rounded-lg py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors">
            {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
          
          <div className="text-center mt-4">
            {isForgot ? (
              <button type="button" onClick={() => setIsForgot(false)} className="text-xs text-neutral-600 hover:text-neutral-900 underline">Back to Login</button>
            ) : (
              <div className="flex justify-between items-center text-xs text-neutral-600 mt-4">
                <button type="button" onClick={() => setIsLogin(!isLogin)} className="hover:text-neutral-900 underline">
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                </button>
                {isLogin && <button type="button" onClick={() => setIsForgot(true)} className="hover:text-neutral-900 underline">Forgot password?</button>}
              </div>
            )}
          </div>`;

code = code.replace(target, replace).replace(target2, replace2).replace(target3, replace3).replace(target4, replace4);

// Remove old switch logic
const targetOldSwitch = `<div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-gray-500 hover:text-neutral-900 underline"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>`;
code = code.replace(targetOldSwitch, "");

// Make sure msg is rendered
const targetError = `{error && (`;
const replaceMsg = `{msg && (
          <div className="bg-green-50 text-green-600 text-xs px-3 py-2 rounded mb-4">
            {msg}
          </div>
        )}
        {error && (`
code = code.replace(targetError, replaceMsg);

fs.writeFileSync('src/components/shop/AuthView.tsx', code);
