import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch override to automatically prepend backend API URL if deployed separately
// and act as a JWT interceptor
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
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

  return originalFetch(resource, config);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
