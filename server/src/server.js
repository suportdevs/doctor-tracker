const config = require('./config');
const app = require('./app');
const connectDB = require('./config/db');
const { seedIfEmpty } = require('./seeders');

if (!config.jwtSecret) {
  console.error('❌ JWT_SECRET is not set. Copy .env.example to .env first.');
  process.exit(1);
}

async function start() {
  await connectDB();
  if (config.seedOnStart) await seedIfEmpty();
  app.listen(config.port, () => console.log(`🚀 Doctor Tracker API running on http://localhost:${config.port}`));
}

start().catch((err) => {
  console.error('❌ Failed to start:', err.message);
  process.exit(1);
});
