const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const injection = `
    const response = await originalFetch(resource, config);
    if (response.status === 429) {
      alert('請求過於頻繁，請稍後再試 (Too Many Requests)');
    }
    return response;
  },
`;

code = code.replace(/return originalFetch\(resource, config\);\n\s*\},/, injection);
fs.writeFileSync('src/main.tsx', code);
console.log("Global fetch interceptor updated.");
