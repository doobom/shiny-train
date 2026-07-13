const fs = require('fs');
let code = fs.readFileSync('src/utils/api.ts', 'utf8');

code = code.replace(
  `  const headers = new Headers(options?.headers);
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }
  const response = await fetch(url, { ...options, headers });`,
  `  const headers = new Headers(options?.headers || {});
  if (token) {
    headers.set('Authorization', \`Bearer \${token}\`);
  }
  // Convert back to plain object to ensure no browser fetch quirks
  const finalHeaders: Record<string, string> = {};
  headers.forEach((value, key) => {
    finalHeaders[key] = value;
  });
  const response = await fetch(url, { ...options, headers: finalHeaders });`
);

fs.writeFileSync('src/utils/api.ts', code);
