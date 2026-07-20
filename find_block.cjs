const fs = require('fs');
const code = fs.readFileSync('server.ts', 'utf8');

// strip out string literals
let stripped = code.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/gs, '""');
// strip out comments
stripped = stripped.replace(/\/\*[\s\S]*?\*\//g, '');
stripped = stripped.replace(/\/\/.*/g, '');

let depth = 0;
let lines = stripped.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
  if (depth < 0) { console.log("Negative depth at line", i+1); depth = 0; }
  if (depth > 5) { console.log("Deep at line", i+1, "depth", depth); }
}
console.log("Final depth", depth);
