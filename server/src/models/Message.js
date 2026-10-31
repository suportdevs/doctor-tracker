const mongoose = require('mongoose');

// Contact-form messages and appointment requests sent from the public website.
const messageSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ['contact', 'appointment'], default: 'contact' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: '' },
    message: { type: String, required: true, trim: true },
    // Appointment requests only.
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
    preferredDate: Date,
    status: { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
  },
  { timestamps: true },
);

messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
