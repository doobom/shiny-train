const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldPreviewLookup = `  let promoDiscount = 0;
  if (promoCode) {
    const p = await db.query.promoCodes.findFirst({ where: eq(schema.promoCodes.code, promoCode) });
    if (p && p.active && (!p.maxUsage || (p.currentUsage || 0) < p.maxUsage) && (!p.expiresAt || new Date(p.expiresAt) > new Date())) {
      if (p.type === 'percent') {
        promoDiscount = Math.floor(subtotalCents * (p.value / 100));
      } else {
        promoDiscount = p.value;
      }
    } else if (p) {
       return res.status(400).json({ error: 'Promo code is invalid, expired, or fully used.' });
    } else {
       return res.status(404).json({ error: 'Promo code not found.' });
    }
  }`;

const newPreviewLookup = `  let promoDiscount = 0;
  if (promoCode) {
    const p = await db.query.discounts.findFirst({ where: eq(schema.discounts.code, promoCode) });
    if (p && p.active && (!p.validUntil || new Date(p.validUntil) > new Date()) && (!p.minOrderValueCents || subtotalCents >= p.minOrderValueCents)) {
      if (p.type === 'percentage') {
        promoDiscount = Math.floor(subtotalCents * (p.value / 100));
      } else {
        promoDiscount = p.value;
      }
    } else if (p) {
       return res.status(400).json({ error: 'Promo code invalid or minimum order value not reached.' });
    } else {
       return res.status(404).json({ error: 'Promo code not found.' });
    }
  }`;

code = code.replace(oldPreviewLookup, newPreviewLookup);

const oldOrderLookup = `  let promoRecord = null;
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
  }`;

const newOrderLookup = `  let promoRecord = null;
  if (promoCode) {
    const p = await db.query.discounts.findFirst({ where: eq(schema.discounts.code, promoCode) });
    if (p && p.active && (!p.validUntil || new Date(p.validUntil) > new Date()) && (!p.minOrderValueCents || totalCents >= p.minOrderValueCents)) {
      promoRecord = p;
      if (p.type === 'percentage') {
        discountCents += Math.floor(totalCents * (p.value / 100));
      } else {
        discountCents += p.value;
      }
    } else {
       return res.status(400).json({ error: 'Promo code invalid or expired.' });
    }
  }`;

code = code.replace(oldOrderLookup, newOrderLookup);

const oldOrderSave = `    if (promoRecord) {
      await tx.update(schema.promoCodes).set({ currentUsage: (promoRecord.currentUsage || 0) + 1 }).where(eq(schema.promoCodes.id, promoRecord.id));
    }`;

const newOrderSave = ``; // We don't have currentUsage in discounts table

code = code.replace(oldOrderSave, newOrderSave);

fs.writeFileSync('server.ts', code);
