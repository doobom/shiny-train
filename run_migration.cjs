const http = require('http');

const req = http.request('http://localhost:3000/api/admin/init-db', { method: 'POST' }, (res) => {
  res.on('data', d => process.stdout.write(d));
});
req.end();
