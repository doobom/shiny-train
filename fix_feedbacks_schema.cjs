const fs = require('fs');
let code = fs.readFileSync('src/server/schema.ts', 'utf-8');

const targetFb = `export const feedbacks = pgTable('feedbacks', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  content: text('content').notNull(),
  adminReply: text('admin_reply'),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});`;

const newFb = `export const feedbacks = pgTable('feedbacks', {
  id: varchar('id', { length: 50 }).primaryKey(),
  userId: varchar('user_id', { length: 50 }).references(() => users.id),
  type: varchar('type', { length: 50 }),
  contact: varchar('contact', { length: 100 }),
  orderId: varchar('order_id', { length: 50 }),
  content: text('content').notNull(),
  adminReply: text('admin_reply'),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});`;

code = code.replace(targetFb, newFb);
fs.writeFileSync('src/server/schema.ts', code);
