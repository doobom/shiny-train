const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `    if (existing) {
      await db.update(schema.cartItems).set({ qty: existing.qty + item.qty }).where(eq(schema.cartItems.id, existing.id));
    } else {
      await db.insert(schema.cartItems).values({
        id: 'ci_' + require('uuid').v4().substring(0, 8),
        cartId: cart.id,
        skuId: item.skuId,
        qty: item.qty
      });
    }`;

const replace = `    if (existing) {
      await db.update(schema.cartItems).set({ qty: existing.qty + item.qty, checked: item.checked ?? existing.checked }).where(eq(schema.cartItems.id, existing.id));
    } else {
      await db.insert(schema.cartItems).values({
        id: 'ci_' + require('uuid').v4().substring(0, 8),
        cartId: cart.id,
        skuId: item.skuId,
        qty: item.qty,
        checked: item.checked ?? true
      });
    }`;

code = code.replace(target, replace);
fs.writeFileSync('server.ts', code);
