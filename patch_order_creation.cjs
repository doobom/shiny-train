const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `
    const rules = await tx.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
    let discountCents = 0;
    let bestExclusive = 0;
    for (const rule of rules) {
      if (totalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
         bestExclusive = rule.reduceCents;
      }
    }
    discountCents += bestExclusive;
    if (discountCents > totalCents) discountCents = totalCents;

    // Get active shipping template
    const templates = await tx.query.shippingTemplates.findMany({ where: eq(schema.shippingTemplates.active, true) });
    const template = templates[0] || { baseFeeCents: 3000, freeShippingThresholdCents: 30000 };
    
    let shippingFeeCents = template.baseFeeCents;
    if (template.freeShippingThresholdCents != null && (totalCents - discountCents) >= template.freeShippingThresholdCents) {
      shippingFeeCents = 0;
    }
`;

code = code.replace(
  /const rules = await tx\.query\.fullReductions\.findMany\(\{ where: eq\(schema\.fullReductions\.active, true\) \}\);[\s\S]*?let shippingFeeCents = \(totalCents - discountCents\) >= 30000 \? 0 : 3000;/m,
  replacement
);

fs.writeFileSync('server.ts', code);
