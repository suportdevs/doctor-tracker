const { z } = require('zod');

const link = {
  label: z.string().trim().min(1, 'Every menu item needs a label').max(60),
  url: z.string().trim().min(1, 'Every menu item needs a link').max(300),
  newTab: z.boolean().default(false),
};
// One level of dropdown children.
const itemSchema = z.object({ ...link, children: z.array(z.object(link)).max(20).default([]) });

const menuSchema = z.object({
  name: z.string().trim().min(2, 'Menu name is too short').max(60).optional(),
  items: z.array(itemSchema).max(30),
});

const createMenuSchema = z.object({ name: z.string().trim().min(2, 'Menu name is too short').max(60) });

module.exports = { menuSchema, createMenuSchema };
