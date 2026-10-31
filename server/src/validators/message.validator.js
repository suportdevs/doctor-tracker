const { z } = require('zod');
const { objectId } = require('./common.validator');

// Contact / appointment form on the public website.
const publicMessageSchema = z.object({
  kind: z.enum(['contact', 'appointment']).default('contact'),
  name: z.string().trim().min(2, 'Please enter your name').max(100),
  email: z.string().trim().email('Please enter a valid email'),
  phone: z.string().trim().max(30).default(''),
  subject: z.string().trim().max(150).default(''),
  message: z.string().trim().min(5, 'Please write a short message').max(3000),
  doctor: objectId.optional().or(z.literal('')),
  preferredDate: z.coerce.date().optional().or(z.literal('')),
  website: z.string().optional(), // honeypot: real visitors never fill this hidden field
});

const messageStatusSchema = z.object({ status: z.enum(['unread', 'read', 'replied']) });

module.exports = { publicMessageSchema, messageStatusSchema };
