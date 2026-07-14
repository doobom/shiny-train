import { fetchWithAuth } from './src/utils/api.js';

async function test() {
  const login = await fetch('http://127.0.0.1:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
  }).then(res => res.json());

  console.log("Login:", login);

  if (login.token) {
    const addRes = await fetch('http://127.0.0.1:3000/api/user/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${login.token}` },
      body: JSON.stringify({ recipient: 'Test', phone: '12345678', detail: 'Address 1', isDefault: true, remark: 'My remark' })
    }).then(res => res.json());

    console.log("Add:", addRes);

    const getRes = await fetch('http://127.0.0.1:3000/api/user/addresses', {
      headers: { 'Authorization': `Bearer ${login.token}` }
    }).then(res => res.json());

    console.log("Get:", getRes);
  }
}
test();
