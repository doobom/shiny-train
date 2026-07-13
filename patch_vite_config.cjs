const fs = require('fs');
let code = fs.readFileSync('vite.config.ts', 'utf8');

code = code.replace(
  'export default defineConfig(() => {\n  return {',
  'export default defineConfig(() => {\n  return {\n    envPrefix: ["VITE_", "B_FRONTEND_URL", "C_FRONTEND_URL"],'
);

fs.writeFileSync('vite.config.ts', code);
