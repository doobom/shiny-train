const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

let depth = 0;
let lines = code.split('\n');
for (let i=0; i<lines.length; i++) {
  let line = lines[i];
  for(let j=0; j<line.length; j++) {
    if(line[j] === '{' && line.substring(j-1, j) !== "'" && line.substring(j-1, j) !== '"') depth++;
    if(line[j] === '}' && line.substring(j-1, j) !== "'" && line.substring(j-1, j) !== '"') depth--;
  }
  if(depth < 0) { console.log('negative depth at line', i+1); depth = 0; }
}
console.log('final depth', depth);
