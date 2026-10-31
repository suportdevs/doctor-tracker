const { z } = require('zod');

const blockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.record(z.any()).default({}),
  style: z.record(z.any()).optional(),
}).passthrough();

const pageSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(150),
  slug: z.string().trim().max(120).optional(),
  blocks: z.array(blockSchema).max(60).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  seoTitle: z.string().max(160).default(''),
  seoDescription: z.string().max(300).default(''),
});

module.exports = { pageSchema };
