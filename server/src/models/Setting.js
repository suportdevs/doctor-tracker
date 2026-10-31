const mongoose = require('mongoose');

// One document per settings group (general, appearance, contact…). See services/settings.service.js for defaults.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

module.exports = mongoose.model('Setting', settingSchema);
