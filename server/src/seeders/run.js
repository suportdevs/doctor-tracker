// CLI: `npm run seed` (fills empty collections) or `npm run seed:fresh` (wipes and re-seeds demo data).
require('../config');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const { seedIfEmpty, seedFresh } = require('./index');

(async () => {
  try {
    await connectDB();
    if (process.argv.includes('--fresh')) await seedFresh();
    else await seedIfEmpty();
    console.log('✅ Seed complete');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
