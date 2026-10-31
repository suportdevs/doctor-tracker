const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

// Admin panel look & feel chosen by each user in the "Customize" panel (saved to their account).
const preferencesSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    accent: { type: String, default: 'indigo' },
    layout: { type: String, enum: ['vertical', 'horizontal'], default: 'vertical' },
    sidebarSide: { type: String, enum: ['left', 'right'], default: 'left' },
    sidebarCollapsed: { type: Boolean, default: false },
    font: { type: String, default: 'inter' },
    fontSize: { type: String, enum: ['sm', 'md', 'lg'], default: 'md' },
    zoom: { type: Number, min: 80, max: 130, default: 100 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.keys(ROLES), default: 'manager' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    // Tokens issued before this moment stop working (set when the password changes).
    passwordChangedAt: Date,
    preferences: { type: preferencesSchema, default: () => ({}) },

    // Two-factor authentication: a 6-digit code is emailed at every sign-in.
    twoFactorEnabled: { type: Boolean, default: false },
    // The current one-time code (hashed), what it is for and how many wrong tries were made.
    otp: {
      type: { hash: String, purpose: String, expiresAt: Date, attempts: Number },
      select: false,
      default: undefined,
    },
    // Password reset link token (hashed) and its expiry.
    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true },
);

// Never send secrets to the client, even if they were selected.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.otp;
    delete ret.resetTokenHash;
    delete ret.resetTokenExpires;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
