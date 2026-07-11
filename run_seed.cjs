import { seedDatabase } from './src/server/seed.js';

seedDatabase()
  .then(() => console.log('Done'))
  .catch(err => console.error('Error:', err));
