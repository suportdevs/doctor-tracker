const { z } = require('zod');
const { phone, date } = require('./common.validator');

const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  specialization: z.string().trim().min(2, 'Specialization is required').max(80),
  hospital: z.string().trim().min(2, 'Hospital is required').max(120),
  phone,
  email: z.string().trim().email('Enter a valid email'),
  // A site path ("/images/…", "/uploads/…") or a full http(s) URL; empty = show initials.
  photo: z.string().trim().max(500).regex(/^(\/|https?:\/\/)/, 'Use an image URL or pick one from the media library').or(z.literal('')).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  joinedAt: date.optional(),
});

module.exports = { doctorSchema };
