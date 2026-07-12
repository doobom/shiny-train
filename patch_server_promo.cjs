const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const tableDdl = `      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" text PRIMARY KEY NOT NULL,`;

const newDdl = `      CREATE TABLE IF NOT EXISTS "promo_codes" (
        "id" text PRIMARY KEY NOT NULL,
        "code" text NOT NULL UNIQUE,
        "type" text NOT NULL,
        "value" integer NOT NULL,
        "max_usage" integer,
        "current_usage" integer DEFAULT 0,
        "expires_at" timestamp,
        "active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now()
      );
      
      CREATE TABLE IF NOT EXISTS "favorites" (
        "id" text PRIMARY KEY NOT NULL,`;

code = code.replace(tableDdl, newDdl);

// Add promo code validation endpoint
const previewEndpoint = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const items = req.body.items || [];
  let subtotalCents = 0;
  let itemDetails = [];`;

const replacePreviewEndpoint = `app.post('/api/checkout/preview', authenticateToken, async (req, res) => {
  const items = req.body.items || [];
  const promoCode = req.body.promoCode;
  let subtotalCents = 0;
  let itemDetails = [];`;

code = code.replace(previewEndpoint, replacePreviewEndpoint);

const calcDiscount = `  // Get active rules
  const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
  let discountCents = 0;
  let bestExclusive = 0;
  for (const rule of rules) {
    if (subtotalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
      bestExclusive = rule.reduceCents;
    }
  }
  discountCents += bestExclusive;
  
  if (discountCents > subtotalCents) discountCents = subtotalCents;`;

const replaceCalcDiscount = `  // Get active rules
  const rules = await db.query.fullReductions.findMany({ where: eq(schema.fullReductions.active, true) });
  let discountCents = 0;
  let bestExclusive = 0;
  for (const rule of rules) {
    if (subtotalCents >= rule.thresholdCents && rule.reduceCents > bestExclusive) {
      bestExclusive = rule.reduceCents;
    }
  }
  discountCents += bestExclusive;

  let promoDiscount = 0;
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
  }
  
  discountCents += promoDiscount;
  if (discountCents > subtotalCents) discountCents = subtotalCents;`;

code = code.replace(calcDiscount, replaceCalcDiscount);

fs.writeFileSync('server.ts', code);
