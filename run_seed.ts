import { seedDatabase } from './src/server/seed.js';

seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
