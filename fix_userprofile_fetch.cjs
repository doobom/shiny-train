const fs = require('fs');
let code = fs.readFileSync('src/components/shop/UserProfile.tsx', 'utf8');

const fetchHeaders = `{ headers: { Authorization: \`Bearer \${token}\` } }`;

code = code.replace(
  /fetch\(\`\/api\/orders\/mine\/\$\{userId\}\`\)\.then\(res => res\.json\(\)\),/,
  `fetch(\`/api/orders/mine/\${userId}\`, { headers: { Authorization: \`Bearer \${token}\` } }).then(res => res.json()),`
);

code = code.replace(
  /fetch\(\`\/api\/feedbacks\/mine\/\$\{userId\}\`\)\.then\(res => res\.json\(\)\),/,
  `fetch(\`/api/feedbacks/mine/\${userId}\`, { headers: { Authorization: \`Bearer \${token}\` } }).then(res => res.json()),`
);

code = code.replace(
  /fetch\('\/api\/faqs'\)\.then\(res => res\.json\(\)\)/,
  `fetch('/api/faqs', { headers: { Authorization: \`Bearer \${token}\` } }).then(res => res.json())`
);

code = code.replace(
  /fetch\(\`\/api\/orders\/\$\{orderId\}\/confirm-receipt\`, \{ method: 'POST' \}\)/,
  `fetch(\`/api/orders/\${orderId}/confirm-receipt\`, { method: 'POST', headers: { Authorization: \`Bearer \${token}\` } })`
);

code = code.replace(
  /fetch\(\`\/api\/orders\/\$\{orderId\}\/cancel\`, \{ method: 'POST' \}\)/,
  `fetch(\`/api/orders/\${orderId}/cancel\`, { method: 'POST', headers: { Authorization: \`Bearer \${token}\` } })`
);

code = code.replace(
  /fetch\('\/api\/feedbacks', \{[\s\S]*?body:/,
  `fetch('/api/feedbacks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${token}\`
      },
      body:`
);

code = code.replace(
  /\`\$\{import\.meta\.env\.VITE_API_BASE_URL\}\/api\/user\/password\`/,
  `'/api/user/password'`
);

fs.writeFileSync('src/components/shop/UserProfile.tsx', code);
