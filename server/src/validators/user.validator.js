const { z } = require('zod');
const { ROLES } = require('../constants/roles');

const userSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().email('Enter a valid email'),
  role: z.enum(Object.keys(ROLES)),
  isActive: z.boolean().default(true),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
});

module.exports = { userSchema };
