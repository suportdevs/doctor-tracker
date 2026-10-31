const mongoose = require('mongoose');
const config = require('./index');

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(config.mongoUri);
  console.log(`✅ MongoDB connected (${mongoose.connection.name})`);
  // Build any indexes declared on the models (no-op when they already exist).
  await Promise.all(Object.values(mongoose.models).map((model) => model.syncIndexes()));
}

module.exports = connectDB;
