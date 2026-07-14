const fs = require('fs');

const schemaFile = fs.readFileSync('src/server/schema.ts', 'utf-8');
const tables = [];

const lines = schemaFile.split('\n');
let currentTable = null;

for (let line of lines) {
  if (line.includes('pgTable(')) {
    const match = line.match(/export const (\w+) = pgTable\('([^']+)'/);
    if (match) {
      currentTable = { name: match[2], columns: [] };
      tables.push(currentTable);
    }
  } else if (currentTable && line.includes('});')) {
    currentTable = null;
  } else if (currentTable) {
    const colMatch = line.match(/^\s*(\w+):\s*([a-zA-Z]+)\('([^']+)'/);
    if (colMatch) {
      const type = colMatch[2];
      const dbCol = colMatch[3];
      let sql_type = 'text';
      if (type === 'integer') sql_type = 'integer';
      if (type === 'boolean') sql_type = 'boolean';
      if (type === 'jsonb') sql_type = 'jsonb';
      if (type === 'timestamp') sql_type = 'timestamp';
      currentTable.columns.push(`"${dbCol}" ${sql_type}`);
    }
  }
}

let ddl = '';
for (let t of tables) {
  ddl += `CREATE TABLE IF NOT EXISTS "${t.name}" (\n`;
  ddl += `  "id" text PRIMARY KEY,\n`;
  for (let c of t.columns) {
    if (c.includes('"id"')) continue;
    ddl += `  ${c},\n`;
  }
  ddl = ddl.slice(0, -2) + '\n);\n';
}

console.log(ddl);
