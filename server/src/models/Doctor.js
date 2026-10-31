const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // Optional photo URL (a site image like /images/doctors/x.jpg or an upload from the media library).
    photo: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    // The date the doctor joined — used by the date filter and dashboard (seed data spreads it over a year).
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Indexes match the list page: every filter is combined with the default "newest first" sort,
// so { filterField, joinedAt } lets MongoDB filter and sort from one index without an in-memory sort.
doctorSchema.index({ joinedAt: -1 });
doctorSchema.index({ specialization: 1, joinedAt: -1 });
doctorSchema.index({ hospital: 1, joinedAt: -1 });
doctorSchema.index({ status: 1, joinedAt: -1 });
doctorSchema.index({ name: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
