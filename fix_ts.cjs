const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// Fix products descZh -> descriptionZh
code = code.replace(
  "ilike(schema.products.descZh, searchPattern)",
  "ilike(schema.products.descriptionZh, searchPattern)"
);
// Fix parseInt for limit/page
code = code.replace(
  "const pageNum = parseInt(String(page), 10) || 1;",
  "const pageNum = parseInt(String(page as string), 10) || 1;"
);
code = code.replace(
  "const limitNum = parseInt(String(limit), 10) || 20;",
  "const limitNum = parseInt(String(limit as string), 10) || 20;"
);

// Fix fullReductions
code = code.replace(
  "const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.status, 'active') });",
  "const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });"
);

// Replace complex rule logic with simple rule logic since schema is simple
const oldRuleLogic = `
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
`;

const newRuleLogic = `
  let discountCents = 0;
  let bestExclusive = 0;
  for (const rule of rules) {
    if (subtotalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
      bestExclusive = rule.reduceCents;
    }
  }
  discountCents += bestExclusive;
`;

code = code.replace(oldRuleLogic, newRuleLogic);

fs.writeFileSync('server.ts', code);
