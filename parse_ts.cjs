const ts = require('typescript');
const fs = require('fs');

const code = fs.readFileSync('server.ts', 'utf8');
const sourceFile = ts.createSourceFile('server.ts', code, ts.ScriptTarget.Latest, true);

let lastValidNode = null;
function visit(node) {
  if (node.pos >= 0 && node.end > 0) {
     lastValidNode = node;
  }
  ts.forEachChild(node, visit);
}

visit(sourceFile);
console.log("Syntax errors?");
