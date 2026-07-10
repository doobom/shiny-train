const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const orderInsertTarget = `    let shippingFeeCents = totalCents >= 30000 ? 0 : 3000;
    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents,
      discountCents: 0,
      grandTotalCents: totalCents + shippingFeeCents,
    });`;

const orderInsertNew = `    let shippingFeeCents = totalCents >= 30000 ? 0 : 3000;
    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents,
      discountCents: 0,
      grandTotalCents: totalCents + shippingFeeCents,
      addressRecipient: address?.recipient,
      addressPhone: address?.phoneEncrypted,
      addressDetail: address?.detail,
      paymentMethod: paymentMethod,
      remark: remark
    });`;

code = code.replace(orderInsertTarget, orderInsertNew);
fs.writeFileSync('server.ts', code);
