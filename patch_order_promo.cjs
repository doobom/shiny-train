const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const orderTop = `app.post('/api/orders', authenticateToken, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  const { address, paymentMethod, remark } = req.body;
  const items = req.body.items || [];`;

const replaceOrderTop = `app.post('/api/orders', authenticateToken, async (req, res) => {
  const user = await db.query.users.findFirst({ where: eq(schema.users.id, (req as any).user.id) });
  const { address, paymentMethod, remark, promoCode } = req.body;
  const items = req.body.items || [];`;

code = code.replace(orderTop, replaceOrderTop);

const orderCalc = `  // Check rules
  const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
  let discountCents = 0;
  let bestExclusive = 0;
  for (const rule of rules) {
    if (totalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
      bestExclusive = rule.reduceCents;
    }
  }
  discountCents += bestExclusive;
  if (discountCents > totalCents) discountCents = totalCents;`;

const replaceOrderCalc = `  // Check rules
  const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
  let discountCents = 0;
  let bestExclusive = 0;
  for (const rule of rules) {
    if (totalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
      bestExclusive = rule.reduceCents;
    }
  }
  discountCents += bestExclusive;

  let promoRecord = null;
  if (promoCode) {
    const p = await db.query.promoCodes.findFirst({ where: eq(schema.promoCodes.code, promoCode) });
    if (p && p.active && (!p.maxUsage || (p.currentUsage || 0) < p.maxUsage) && (!p.expiresAt || new Date(p.expiresAt) > new Date())) {
      promoRecord = p;
      if (p.type === 'percent') {
        discountCents += Math.floor(totalCents * (p.value / 100));
      } else {
        discountCents += p.value;
      }
    } else {
       return res.status(400).json({ error: 'Promo code invalid or expired.' });
    }
  }
  
  if (discountCents > totalCents) discountCents = totalCents;`;

code = code.replace(orderCalc, replaceOrderCalc);

const orderSave = `    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      totalCents,
      shippingFeeCents,
      discountCents,
      grandTotalCents,
      paymentMethod,
      status: 'pending_payment',
      remark
    });`;

const replaceOrderSave = `    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      totalCents,
      shippingFeeCents,
      discountCents,
      grandTotalCents,
      paymentMethod,
      status: 'pending_payment',
      remark
    });
    if (promoRecord) {
      await tx.update(schema.promoCodes).set({ currentUsage: (promoRecord.currentUsage || 0) + 1 }).where(eq(schema.promoCodes.id, promoRecord.id));
    }`;

code = code.replace(orderSave, replaceOrderSave);

fs.writeFileSync('server.ts', code);
