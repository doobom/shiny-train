const options = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ a: 1 })
};
const headers = new Headers(options?.headers);
headers.set('Authorization', 'Bearer token');
console.log({ ...options, headers });
