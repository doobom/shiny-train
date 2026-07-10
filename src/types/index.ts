/**
 * Shared Type Definitions matching SDRS v2.2 & DB Schema
 */

export type Locale = 'zh-HK' | 'en';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  phoneEncrypted?: string;
  locale: Locale;
  memberLevelId?: string;
  status: 'active' | 'disabled';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemberLevel {
  id: string;
  nameZh: string;
  nameEn: string;
  sort: number;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  recipient: string;
  phoneEncrypted: string;
  detail: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  nameZh: string;
  nameEn: string;
  parentId?: string;
  sort: number;
  disabled: boolean;
}

export interface Product {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh?: string;
  descriptionEn?: string;
  priceOriginalCents: number; // Stored in cents (D19)
  priceAfterCents: number;    // Stored in cents (D19)
  categoryId: string;
  status: 'draft' | 'on_shelf' | 'off_shelf';
  images: string[];
  specSnapshotSchema?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpec {
  id: string;
  productId: string;
  specNameZh: string;
  specNameEn: string;
  priceOriginalCents?: number;
  priceAfterCents?: number;
}

export interface Inventory {
  skuId: string;
  stock: number;
  lockedStock: number;
  warnThreshold?: number;
}

export interface CartItem {
  id: string;
  cartId: string;
  skuId: string;
  qty: number;
  checked: boolean;
  createdAt: string;
}

export interface Discount {
  id: string;
  productId: string;
  type: 'percent' | 'special';
  percentValue?: number; // 0.0 to 1.0 e.g. 0.85 for 15% off
  specialPriceCents?: number;
  startAt: string;
  endAt: string;
  status: 'pending' | 'active' | 'expired';
}

export interface FullReduction {
  id: string;
  nameZh: string;
  nameEn: string;
  thresholdCents: number;
  reductionCents: number;
  stackable: boolean;
  scope: 'all' | 'category';
  categoryId?: string;
  startAt: string;
  endAt: string;
  status: 'pending' | 'active' | 'expired';
}

export interface ShippingTemplate {
  id: string;
  nameZh: string;
  nameEn: string;
  firstWeightCents: number;
  firstWeightKg: number;
  extraWeightCents: number;
  freeShippingThresholdCents?: number;
  isDefault: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  status: 'pending_payment' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'pending_review' | 'paid' | 'failed';
  addressSnapshot: any; // jsonb Address
  shippingMethod: string;
  trackingNo?: string;
  remark?: string;
  subtotalCents: number;
  discountCents: number;
  shippingFeeCents: number;
  totalCents: number;
  paidAt?: string;
  shippedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productSnapshot: any; // jsonb title, specs, original product info
  skuId: string;
  qty: number;
  priceAfterCents: number;
}

export interface Payment {
  id: string;
  orderId: string;
  method: 'fps' | 'payme' | 'alipayhk' | 'bank_transfer';
  status: 'pending' | 'pending_review' | 'paid' | 'failed';
  amountCents: number;
  voucherUrl?: string;
  gatewayTxnId?: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentMethod {
  id: 'fps' | 'payme' | 'alipayhk' | 'bank_transfer';
  enabled: boolean;
  merchantInfoEncrypted?: string;
  config: any;
}

export interface Banner {
  id: string;
  copyZh?: string;
  copyEn?: string;
  imageUrl: string;
  link?: string;
  sort: number;
  enabled: boolean;
}

export interface Announcement {
  id: string;
  contentZh?: string;
  contentEn?: string;
  publishedAt?: string;
  enabled: boolean;
}

export interface Recommendation {
  id: string;
  productId: string;
  slot: 'recommend' | 'hot' | 'new';
  sort: number;
}

export interface FAQ {
  id: string;
  questionZh: string;
  questionEn: string;
  answerZh: string;
  answerEn: string;
  sort: number;
  enabled: boolean;
}

export interface Feedback {
  id: string;
  userId?: string;
  contact?: string;
  type: 'inquiry' | 'complaint' | 'suggestion';
  orderId?: string;
  content: string;
  reply?: string;
  status: 'pending' | 'processing' | 'replied' | 'closed';
  createdAt: string;
  repliedAt?: string;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  roleId: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Role {
  id: string;
  key: string;
  nameZh: string;
  nameEn: string;
  isBuiltin: boolean;
  createdAt: string;
}

export interface Permission {
  key: string;
  groupZh: string;
  groupEn: string;
  labelZh: string;
  labelEn: string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  permission: string;
  access: 'full' | 'readonly' | 'none';
}

export interface AuditLog {
  id: string;
  adminId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  detail: any;
  ip?: string;
  createdAt: string;
}

export interface PlatformSettings {
  key: string;
  value: any;
  updatedAt: string;
}
