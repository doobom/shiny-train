const fs = require('fs');
let code = fs.readFileSync('src/components/shop/AuthView.tsx', 'utf8');

const oldBtn = `<button 
            type="submit" 
            className="w-full bg-neutral-950 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>`;

const newBtn = `<button 
            type="submit" 
            className="w-full bg-neutral-950 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {isForgot ? 'Send Reset Link' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>`;

code = code.replace(oldBtn, newBtn);

const oldFooter = `<div className="mt-6 text-center text-xs text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-neutral-900 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>`;

const newFooter = `<div className="mt-6 text-center text-xs text-gray-500">
          {isForgot ? (
            <button type="button" onClick={() => setIsForgot(false)} className="font-bold text-neutral-900 hover:underline">Back to Login</button>
          ) : (
            <>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => { setIsLogin(!isLogin); setIsForgot(false); }}
                className="font-bold text-neutral-900 hover:underline"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
              {isLogin && (
                <div className="mt-2">
                  <button type="button" onClick={() => setIsForgot(true)} className="font-bold text-neutral-900 hover:underline">Forgot Password?</button>
                </div>
              )}
            </>
          )}
        </div>`;

code = code.replace(oldFooter, newFooter);

fs.writeFileSync('src/components/shop/AuthView.tsx', code);
