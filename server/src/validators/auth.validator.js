const { z } = require('zod');

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

const profileSchema = z.object({ name: z.string().trim().min(2), email: z.string().email() }).partial();

const newPassword = z.string().min(8, 'Password must be at least 8 characters').max(100);

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword,
});

const forgotPasswordSchema = z.object({ email: z.string().trim().email('Enter a valid email') });

const resetPasswordSchema = z.object({
  token: z.string().min(20, 'This reset link is invalid'),
  password: newPassword,
});

const code = z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code');
const verifyLoginSchema = z.object({ challenge: z.string().min(10), code });
const challengeSchema = z.object({ challenge: z.string().min(10) });
const enableTwoFactorSchema = z.object({ code });
const disableTwoFactorSchema = z.object({ password: z.string().min(1, 'Enter your password') });

// Admin "Customize" panel. Only these keys and values can be saved.
const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  accent: z.enum(['indigo', 'blue', 'emerald', 'violet', 'rose', 'amber']),
  layout: z.enum(['vertical', 'horizontal']),
  sidebarSide: z.enum(['left', 'right']),
  sidebarCollapsed: z.boolean(),
  font: z.enum(['inter', 'jakarta', 'dmsans', 'system']),
  fontSize: z.enum(['sm', 'md', 'lg']),
  zoom: z.number().int().min(80).max(130),
}).partial();

module.exports = {
  loginSchema, profileSchema, passwordSchema, forgotPasswordSchema, resetPasswordSchema,
  verifyLoginSchema, challengeSchema, enableTwoFactorSchema, disableTwoFactorSchema, preferencesSchema,
};
