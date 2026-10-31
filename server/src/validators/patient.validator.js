const { z } = require('zod');
const { CONDITIONS, GENDERS } = require('../constants/patient');
const { phone, objectId, date } = require('./common.validator');

const patientSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(100),
  age: z.coerce.number({ invalid_type_error: 'Age must be a number' }).int().min(0).max(130),
  gender: z.enum(GENDERS),
  phone: phone.or(z.literal('')).default(''),
  email: z.string().trim().email('Enter a valid email').or(z.literal('')).default(''),
  condition: z.enum(CONDITIONS).default('stable'),
  diagnosis: z.string().trim().max(200).default(''),
  notes: z.string().trim().max(2000).default(''),
  doctor: objectId,
  visitDate: date.optional(),
});

module.exports = { patientSchema };
