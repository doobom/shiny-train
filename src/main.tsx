import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Analytics } from '@vercel/analytics/react';

// Global fetch override to automatically prepend backend API URL if deployed separately
// and act as a JWT interceptor
const originalFetch = window.fetch;
Object.defineProperty(window, 'fetch', {
  value: async (...args: Parameters<typeof originalFetch>) => {
    let [resource, config] = args;
    // @ts-ignore
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (typeof resource === 'string' && resource.startsWith('/api') && baseUrl) {
      resource = `${baseUrl}${resource}`;
    }

    // JWT Token Interceptor
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config = config || {};
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    
    const response = await originalFetch(resource, config);
    if (response.status === 429) {
      alert('請求過於頻繁，請稍後再試 (Too Many Requests)');
    }
    return response;
  },

  configurable: true,
  writable: true
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
