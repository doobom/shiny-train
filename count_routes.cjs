const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.(get|post|put|patch|delete)\(/g;
let match;
const indices = [];
while ((match = regex.exec(code)) !== null) {
  indices.push(match.index);
}

for (let i=0; i<indices.length; i++) {
  const start = indices[i];
  const end = i < indices.length - 1 ? indices[i+1] : code.length;
  const chunk = code.substring(start, end);
  let depth = 0;
  for(let j=0; j<chunk.length; j++) {
    if(chunk[j]==='{') depth++;
    if(chunk[j]==='}') depth--;
  }
  if (depth !== 0) {
     console.log("Unbalanced route starting at index", start, "depth:", depth);
     console.log(chunk.substring(0, 100).replace(/\n/g, ' '));
  }
}
