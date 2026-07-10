const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const orderInsertTarget = `    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents: 0,
      discountCents: 0,
      grandTotalCents: totalCents,
    });`;

const newOrderInsert = `    let shippingFeeCents = totalCents >= 30000 ? 0 : 3000;
    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents,
      discountCents: 0,
      grandTotalCents: totalCents + shippingFeeCents,
    });`;

code = code.replace(orderInsertTarget, newOrderInsert);

fs.writeFileSync('server.ts', code);
