import { db } from './src/server/db.js';
import * as schema from './src/server/schema.js';

async function run() {
  try {
    const res = await db.insert(schema.addresses).values({
      id: "addr_123",
      userId: "usr_abc",
      recipient: "Test",
      phone: "123",
      detail: "123",
      isDefault: false,
      remark: "rem"
    });
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}
run();
