const mongoose = require('mongoose');

// A website page built from blocks: [{ id, type, data, style }]. The block types live in the client
// (client/src/config/blocks.js) so new blocks never need a database change.
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    blocks: { type: [mongoose.Schema.Types.Mixed], default: [] },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true, minimize: false },
);

pageSchema.index({ status: 1, updatedAt: -1 });

module.exports = mongoose.model('Page', pageSchema);
