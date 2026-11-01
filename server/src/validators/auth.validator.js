const { z } = require('zod');

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const profileSchema = z.object({ name: z.string().trim().min(2), email: z.string().email() }).partial();

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

module.exports = { loginSchema, profileSchema, passwordSchema };
