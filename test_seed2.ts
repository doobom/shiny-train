import { seedDatabase } from './src/server/seed.ts';
seedDatabase().then(() => process.exit(0)).catch(console.error);
