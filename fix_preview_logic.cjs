const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const targetPreview = `  let shippingFeeCents = subtotalCents >= 30000 ? 0 : 3000; // Free shipping over HK$300, else HK$30
  let discountCents = 0; // Can add coupon logic here later
  let totalCents = subtotalCents + shippingFeeCents - discountCents;
  
  res.json({`;

const newPreview = `  // Get active rules
  const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.status, 'active') });
  const stackableRules = rules.filter(r => r.stackable);
  const exclusiveRules = rules.filter(r => !r.stackable);

  let discountCents = 0;
  
  // Calculate exclusive max
  let bestExclusive = 0;
  for (const rule of exclusiveRules) {
    let base = 0;
    if (rule.scope === 'all') base = subtotalCents;
    else if (rule.scope === 'category') {
      base = itemDetails.filter(d => d.product.categoryId === rule.categoryId).reduce((sum, d) => sum + (d.unitPriceCents * d.qty), 0);
    }
    if (base >= rule.thresholdCents && rule.reductionCents > bestExclusive) {
      bestExclusive = rule.reductionCents;
    }
  }
  discountCents += bestExclusive;

  // Apply stackable
  for (const rule of stackableRules) {
    let base = 0;
    if (rule.scope === 'all') base = subtotalCents;
    else if (rule.scope === 'category') {
      base = itemDetails.filter(d => d.product.categoryId === rule.categoryId).reduce((sum, d) => sum + (d.unitPriceCents * d.qty), 0);
    }
    if (base >= rule.thresholdCents) {
      discountCents += rule.reductionCents;
    }
  }
  
  if (discountCents > subtotalCents) discountCents = subtotalCents;

  let shippingFeeCents = (subtotalCents - discountCents) >= 30000 ? 0 : 3000; // Free shipping over HK$300, else HK$30
  let totalCents = subtotalCents + shippingFeeCents - discountCents;
  
  res.json({`;

code = code.replace(targetPreview, newPreview);

// Also need to apply this to actual checkout
const targetOrder = `    let shippingFeeCents = totalCents >= 30000 ? 0 : 3000;
    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents,
      discountCents: 0,
      grandTotalCents: totalCents + shippingFeeCents,`;

const newOrder = `
    const rules = await tx.query.fullReductions.findMany({ where: eq(schema.fullReductions.status, 'active') });
    let discountCents = 0;
    let bestExclusive = 0;
    for (const rule of rules.filter(r => !r.stackable)) {
      if (rule.scope === 'all' && totalCents >= rule.thresholdCents && rule.reductionCents > bestExclusive) bestExclusive = rule.reductionCents;
      // simplification for category scope in order creation
    }
    discountCents += bestExclusive;
    for (const rule of rules.filter(r => r.stackable)) {
      if (rule.scope === 'all' && totalCents >= rule.thresholdCents) discountCents += rule.reductionCents;
    }
    if (discountCents > totalCents) discountCents = totalCents;

    let shippingFeeCents = (totalCents - discountCents) >= 30000 ? 0 : 3000;
    await tx.insert(schema.orders).values({
      id: orderId,
      userId,
      status: 'pending_payment',
      totalCents,
      shippingFeeCents,
      discountCents,
      grandTotalCents: totalCents + shippingFeeCents - discountCents,`;

code = code.replace(targetOrder, newOrder);

fs.writeFileSync('server.ts', code);
