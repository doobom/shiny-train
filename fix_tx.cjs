const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const oldTxLogic = `
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
`;

const newTxLogic = `
    const rules = await tx.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
    let discountCents = 0;
    let bestExclusive = 0;
    for (const rule of rules) {
      if (totalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
         bestExclusive = rule.reduceCents;
      }
    }
    discountCents += bestExclusive;
`;

code = code.replace(oldTxLogic, newTxLogic);

// Fix startAt in fullReductions
code = code.replace(
  "await db.query.fullReductions.findMany({ orderBy: [desc(schema.fullReductions.startAt)] });",
  "await db.query.fullReductions.findMany({ orderBy: [desc(schema.fullReductions.id)] });"
);

// Fix object literal keys in line 801
// 801: await db.insert(schema.siteConfig).values(Object.entries(data).map(([key, value]) => ({ key, value: String(value) })));
code = code.replace(
  "await db.insert(schema.siteConfig).values(Object.entries(data).map(([key, value]) => ({ key, value: String(value) })));",
  "await db.insert(schema.siteConfig).values(Object.entries(data).map(([k, v]) => ({ key: k, value: String(v) })));"
);

// Fix 658: totalSales += i.qty;
code = code.replace(
  "totalSales += i.qty;",
  "totalSales += Number(i.qty);"
);

fs.writeFileSync('server.ts', code);
