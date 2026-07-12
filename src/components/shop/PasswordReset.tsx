import React, { useState } from 'react';
import { fetchWithAuth as apiFetch } from '../../utils/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters');
      return;
    }

    setStatus('loading');
    try {
      const res = await apiFetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setMessage('Password reset successfully! You can now login.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password.');
      }
    } catch (e) {
      setStatus('error');
      setMessage('Network error');
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-150 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Invalid Link</h2>
        <p className="text-gray-500 text-sm mb-6">No reset token found in URL.</p>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-bold">Go to Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-gray-150">
      <h2 className="text-2xl font-black mb-6">Reset Password</h2>
      {status === 'success' ? (
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-900 font-bold mb-6">{message}</p>
          <button onClick={() => window.location.href = '/'} className="px-6 py-2 bg-neutral-900 text-white rounded-lg font-bold">Go to Login</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">New Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full border p-2 rounded-lg" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required className="w-full border p-2 rounded-lg" />
          </div>
          {status === 'error' && <p className="text-red-500 text-xs font-bold">{message}</p>}
          <button type="submit" disabled={status === 'loading'} className="w-full py-2 bg-neutral-900 text-white rounded-lg font-bold">
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
