import { fetchWithAuth as apiFetch } from '../../utils/api';
import React, { useState } from 'react';

async function hashPassword(password: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

interface AuthViewProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export default function AuthView({ onLoginSuccess }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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
    }
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const hashedPassword = await hashPassword(password);
      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: hashedPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        if (!isLogin && !data.token) {
          // If register doesn't return token, automatically login
          const loginRes = await apiFetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: hashedPassword })
          });
          const loginData = await loginRes.json();
          if (loginData.success) {
            onLoginSuccess(loginData.token, loginData.user);
          }
        } else {
          onLoginSuccess(data.token, data.user);
        }
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-6 text-center">{isLogin ? 'Login to your account' : 'Create an account'}</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900" 
              placeholder="name@example.com"
            />
          </div>
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
            className="w-full bg-neutral-950 text-white font-bold text-sm py-2.5 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="font-bold text-neutral-900 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
