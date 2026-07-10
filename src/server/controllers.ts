import { dbInstance } from './db.ts';
import { 
  User, Category, Product, ProductSpec, Inventory, 
  CartItem, Discount, FullReduction, ShippingTemplate, 
  Order, OrderItem, Payment, FAQ, Feedback, 
  Admin, Role, RolePermission, AuditLog, PlatformSettings, Locale, Banner, Announcement, Recommendation
} from '../types/index.ts';

// Helper to generate a unique ID
export const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Order number generator matching D20⑨ rules: YYYYMMDDHHmmss + 4 random digits
export const generateOrderNo = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${year}${month}${day}${hour}${minute}${second}${rand}`;
};

// Simple AES-like placeholder (Base64) for sensitive fields
export const encrypt = (text: string) => Buffer.from(text).toString('base64');
export const decrypt = (cipher: string) => Buffer.from(cipher, 'base64').toString('utf-8');

/**
 * 1. Checkout & Shipping Calculation Engines (SDRS §7.4 & D20⑤)
 */
export const calculateShippingAndDiscount = (
  items: { skuId: string; qty: number }[],
  addressId?: string
) => {
  return dbInstance.transaction((state) => {
    let subtotalCents = 0;
    const categoryTotals: Record<string, number> = {};
    const itemDetails: any[] = [];

    // 1. Calculate price with product-level discounts first
    for (const item of items) {
      const spec = state.productSpecs.find(s => s.id === item.skuId);
      if (!spec) continue;

      const product = state.products.find(p => p.id === spec.productId);
      if (!product || product.status !== 'on_shelf') continue;

      // Determine price
      let unitPriceCents = spec.priceAfterCents || spec.priceOriginalCents || product.priceAfterCents || product.priceOriginalCents;

      // Apply single-product discounts if active
      const activeDiscount = state.discounts.find(
        d => d.productId === product.id && d.status === 'active' &&
        new Date(d.startAt) <= new Date() && new Date(d.endAt) >= new Date()
      );

      if (activeDiscount) {
        if (activeDiscount.type === 'percent' && activeDiscount.percentValue) {
          unitPriceCents = Math.round(unitPriceCents * activeDiscount.percentValue);
        } else if (activeDiscount.type === 'special' && activeDiscount.specialPriceCents) {
          unitPriceCents = activeDiscount.specialPriceCents;
        }
      }

      const itemTotal = unitPriceCents * item.qty;
      subtotalCents += itemTotal;

      categoryTotals[product.categoryId] = (categoryTotals[product.categoryId] || 0) + itemTotal;

      itemDetails.push({
        spec,
        product,
        qty: item.qty,
        unitPriceCents,
        itemTotalCents: itemTotal
      });
    }

    // 2. Compute full reductions (D20 presets & SDRS §7.4)
    let totalDiscountCents = 0;
    const activeFullReductions = state.fullReductions.filter(
      fr => fr.status === 'active' &&
      new Date(fr.startAt) <= new Date() && new Date(fr.endAt) >= new Date()
    );

    // Multi-rule resolution: partition into stackable & exclusive rules
    const stackableRules = activeFullReductions.filter(fr => fr.stackable);
    const exclusiveRules = activeFullReductions.filter(fr => !fr.stackable);

    // Run exclusive rule evaluation to find "最优" (maximum reduction cents)
    let bestExclusiveReduction = 0;
    for (const rule of exclusiveRules) {
      let baseAmount = 0;
      if (rule.scope === 'all') {
        baseAmount = subtotalCents;
      } else if (rule.scope === 'category' && rule.categoryId) {
        baseAmount = categoryTotals[rule.categoryId] || 0;
      }

      if (baseAmount >= rule.thresholdCents) {
        if (rule.reductionCents > bestExclusiveReduction) {
          bestExclusiveReduction = rule.reductionCents;
        }
      }
    }
    totalDiscountCents += bestExclusiveReduction;

    // Apply stackable rules
    for (const rule of stackableRules) {
      let baseAmount = 0;
      if (rule.scope === 'all') {
        baseAmount = subtotalCents;
      } else if (rule.scope === 'category' && rule.categoryId) {
        baseAmount = categoryTotals[rule.categoryId] || 0;
      }

      if (baseAmount >= rule.thresholdCents) {
        totalDiscountCents += rule.reductionCents;
      }
    }

    // Safety bounds on discount
    if (totalDiscountCents > subtotalCents) {
      totalDiscountCents = subtotalCents;
    }

    // 3. Calculate shipping (SDRS §6.3 & D20⑤)
    const defaultTemplate = state.shippingTemplates.find(t => t.isDefault && t.enabled) || {
      firstWeightCents: 3000,
      firstWeightKg: 1.0,
      extraWeightCents: 1000,
      freeShippingThresholdCents: 30000
    };

    // Standardized weight calculation (approx 0.5kg per item for simplistic mockup)
    const totalWeightKg = items.reduce((sum, item) => sum + (0.5 * item.qty), 0);
    let shippingFeeCents = 0;

    const afterReductionPrice = subtotalCents - totalDiscountCents;

    // Free shipping boundary check
    const freeThreshold = defaultTemplate.freeShippingThresholdCents || 30000;
    if (afterReductionPrice >= freeThreshold) {
      shippingFeeCents = 0;
    } else {
      // Calculate first + extra weights
      const firstWeight = Number(defaultTemplate.firstWeightKg);
      shippingFeeCents += defaultTemplate.firstWeightCents;
      if (totalWeightKg > firstWeight) {
        const extraWeight = Math.ceil(totalWeightKg - firstWeight);
        shippingFeeCents += extraWeight * defaultTemplate.extraWeightCents;
      }
    }

    const totalCents = afterReductionPrice + shippingFeeCents;

    return {
      subtotalCents,
      discountCents: totalDiscountCents,
      shippingFeeCents,
      totalCents,
      itemDetails
    };
  });
};
