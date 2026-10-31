const slugifyLib = require('slugify');

const slugify = (text) => slugifyLib(String(text || ''), { lower: true, strict: true, trim: true }) || `page-${Date.now()}`;

module.exports = slugify;
