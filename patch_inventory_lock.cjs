const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const lockLogic = `
    // Check inventory and lock stock securely
    for (const item of items) {
      const res = await tx.execute(
        sql\`UPDATE \${schema.inventory} SET locked_stock = locked_stock + \${item.qty} WHERE sku_id = \${item.skuId} AND (stock - locked_stock) >= \${item.qty} RETURNING sku_id\`
      );
      if (res.length === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }
    }
`;

code = code.replace(
  /\/\/ Check inventory[\s\S]*?await tx\.update\(schema\.inventory\)[\s\S]*?\.where\(eq\(schema\.inventory\.skuId, item\.skuId\)\);\n    \}/m,
  lockLogic
);

fs.writeFileSync('server.ts', code);
