const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.keys(ROLES), default: 'admin' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: Date,
    // Tokens issued before this moment stop working (set when the password changes).
    passwordChangedAt: Date,
  },
  { timestamps: true },
);

// Never send the password hash to the client, even if it was selected.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
