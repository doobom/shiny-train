import { db } from './db.js';
import * as schema from './schema.js';
import { v4 as uuidv4 } from 'uuid';

import fs from 'fs';
import path from 'path';
import pool from './postgres_pool.js';

export async function seedDatabase() {
  console.log('Initializing database schema...');
  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'src/server/schema.sql'), 'utf-8');
    await pool.query(schemaSql);
    console.log('Schema created successfully.');
  } catch (err) {
    console.error('Failed to create schema:', err);
  }

  console.log('Seeding database...');
  // Add Admin
  const adminEmail = 'admin@example.com';
  const existingAdmin = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, adminEmail) });
  
  if (!existingAdmin) {
    await db.insert(schema.users).values({
      id: `usr_${uuidv4().substring(0, 8)}`,
      email: adminEmail,
      passwordHash: 'admin123',
      locale: 'zh-HK',
      status: 'active'
    });
    console.log('Admin user created.');
  }

  // Categories
  const existingCategories = await db.query.categories.findMany();
  let catId1, catId2, catId3;
  if (existingCategories.length === 0) {
    catId1 = `cat_${uuidv4().substring(0, 8)}`;
    catId2 = `cat_${uuidv4().substring(0, 8)}`;
    catId3 = `cat_${uuidv4().substring(0, 8)}`;
    
    await db.insert(schema.categories).values([
      { id: catId1, nameZh: '電子產品', nameEn: 'Electronics', sort: 1 },
      { id: catId2, nameZh: '家居生活', nameEn: 'Home Living', sort: 2 },
      { id: catId3, nameZh: '運動配件', nameEn: 'Sports', sort: 3 }
    ]);
    console.log('Categories created.');

    // Products
    const prodId1 = `prod_${uuidv4().substring(0, 8)}`;
    const prodId2 = `prod_${uuidv4().substring(0, 8)}`;
    
    await db.insert(schema.products).values([
      {
        id: prodId1,
        nameZh: '極速充電寶 10000mAh',
        nameEn: 'Fast Charging PowerBank 10000mAh',
        descriptionZh: '支持 PD20W 雙向快充。',
        descriptionEn: 'Supports PD20W fast charging.',
        priceOriginalCents: 29900,
        priceAfterCents: 19900,
        categoryId: catId1,
        images: ['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80']
      },
      {
        id: prodId2,
        nameZh: '無線降噪耳機',
        nameEn: 'Wireless ANC Earbuds',
        descriptionZh: '主動降噪，30小時續航。',
        descriptionEn: 'Active noise cancellation, 30h battery.',
        priceOriginalCents: 89900,
        priceAfterCents: 59900,
        categoryId: catId1,
        images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80']
      }
    ]);

    // Specs
    const specId1 = `spec_${uuidv4().substring(0, 8)}`;
    const specId2 = `spec_${uuidv4().substring(0, 8)}`;
    
    await db.insert(schema.productSpecs).values([
      { id: specId1, productId: prodId1, specNameZh: '黑色', specNameEn: 'Black', priceOriginalCents: 29900, priceAfterCents: 19900 },
      { id: specId2, productId: prodId2, specNameZh: '白色', specNameEn: 'White', priceOriginalCents: 89900, priceAfterCents: 59900 }
    ]);

    // Inventory
    await db.insert(schema.inventory).values([
      { skuId: specId1, stock: 100, lockedStock: 0 },
      { skuId: specId2, stock: 50, lockedStock: 0 }
    ]);
    console.log('Products created.');
  } else {
    console.log('Database already contains categories.');
  }
}
