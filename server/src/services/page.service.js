const sanitizeHtml = require('sanitize-html');
const Page = require('../models/Page');
const HttpError = require('../utils/HttpError');
const slugify = require('../utils/slugify');

// Addresses the site itself uses — a page can't take them over.
const RESERVED_SLUGS = ['admin', 'api', 'uploads', '_next', 'doctors-api'];

// Rich-text blocks store HTML; strip anything that could run scripts on the public site.
const cleanHtml = (html) => sanitizeHtml(String(html || ''), {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
  allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'], '*': ['class'] },
});

const cleanBlocks = (blocks) => blocks.map((b) => (typeof b.data.html === 'string' ? { ...b, data: { ...b.data, html: cleanHtml(b.data.html) } } : b));

// "About us" → "about-us", or "about-us-1" when taken (ignoring the page being edited).
async function uniqueSlug(text, excludeId) {
  const base = slugify(text);
  if (RESERVED_SLUGS.includes(base)) throw new HttpError(422, `slug: "${base}" is reserved, choose another address`);
  let slug = base;
  for (let i = 1; await Page.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) }); i++) slug = `${base}-${i}`;
  return slug;
}

module.exports = { cleanBlocks, uniqueSlug };
