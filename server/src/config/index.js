// All environment variables are read here, once. Other files import this instead of using process.env.
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27018/doctor_tracker',
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
  seedOnStart: process.env.SEED_ON_START === 'true',
  // Outgoing email (password reset links, 2FA codes). Leave SMTP_HOST empty to run without email.
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'Doctor Tracker <no-reply@doctortracker.dev>',
  },
  // Demo fallback: with no SMTP, show reset links / 2FA codes on screen. Set to "false" in production.
  mailPreview: process.env.MAIL_PREVIEW !== 'false',
};

module.exports = config;
