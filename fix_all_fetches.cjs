const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/components');
files.push('src/App.tsx');

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  if (code.includes('fetch(') || code.includes('fetch.(')) {
    let depth = file.split(path.sep).length - 2; 
    if (file === 'src/App.tsx') depth = 0;
    
    let relPath = depth === 0 ? './utils/api' : '../'.repeat(depth) + 'utils/api'; 
    if (depth > 0) relPath = relPath.substring(0, relPath.length); // just a trick

    if (!code.includes('apiFetch')) {
       code = `import { fetchWithAuth as apiFetch } from '${relPath}';\n` + code;
    }
    
    code = code.replace(/(?<!\.)\bfetch\s*\(/g, 'apiFetch(');
    
    fs.writeFileSync(file, code);
  }
}
