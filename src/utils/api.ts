export const fetchWithAuth = async (url: RequestInfo | URL, options?: RequestInit) => {
  const token = localStorage.getItem('token');
  
  // Convert existing headers to a plain object
  const plainHeaders: Record<string, string> = {};
  if (options?.headers) {
    const h = new Headers(options.headers);
    h.forEach((value, key) => {
      plainHeaders[key] = value;
    });
  }
  
  if (token) {
    plainHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers: plainHeaders });

  if (response.status === 401) {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth-error', { detail: 'Unauthorized' }));
    // In a real app, you might want to redirect to login:
    // window.location.href = '/'; 
    // But since we use React state, we dispatch an event that App.tsx can listen to.
  } else if (response.status === 403) {
    alert('Access Denied: You do not have permission to perform this action.');
  }

  // Intercepting specific application error codes via cloned response parsing
  // This is a bit tricky with fetch, we can check if it's JSON and has an error code.
  // To avoid consuming the response body, we clone it.
  const contentType = response.headers.get('content-type');
  if (response.status >= 400 && contentType && contentType.includes('application/json')) {
    const clone = response.clone();
    try {
      const data = await clone.json();
      if (data.code === 'PURCHASE_LIMIT_EXCEEDED') {
        alert(data.message || 'Purchase limit exceeded.');
      } else if (data.error === 'PURCHASE_LIMIT_EXCEEDED') {
        alert(data.message || 'Purchase limit exceeded.');
      }
    } catch (e) {}
  }

  return response;
};
