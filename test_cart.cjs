const http = require('http');

const data = JSON.stringify({ skuId: "spec_123", qty: 2 });

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/cart/items',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => console.log('Response:', body));
});

req.write(data);
req.end();
