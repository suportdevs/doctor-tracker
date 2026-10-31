const mongoose = require('mongoose');
const { CONDITIONS, GENDERS } = require('../constants/patient');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 130 },
    gender: { type: String, enum: GENDERS, required: true },
    phone: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: '' },
    condition: { type: String, enum: CONDITIONS, default: 'stable' },
    diagnosis: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    visitDate: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// { doctor, visitDate } serves "patients of a doctor" lists and the patients-per-doctor aggregation.
patientSchema.index({ doctor: 1, visitDate: -1 });
patientSchema.index({ condition: 1, visitDate: -1 });
patientSchema.index({ gender: 1, visitDate: -1 });
patientSchema.index({ visitDate: -1 });

module.exports = mongoose.model('Patient', patientSchema);
