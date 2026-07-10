import { db } from './src/server/db.ts';
import * as schema from './src/server/schema.ts';

async function check() {
  const users = await db.query.users.findMany();
  console.log('Users in DB:', users.length);
  const products = await db.query.products.findMany();
  console.log('Products in DB:', products.length);
}

check().then(() => process.exit(0));
