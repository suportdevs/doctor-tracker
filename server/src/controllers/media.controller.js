const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');
const { UPLOAD_DIR } = require('../middlewares/upload.middleware');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { paginate, pageMeta } = require('../utils/pagination');
const { searchFilter } = require('../utils/queryFilters');

const listMedia = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 24);
  const filter = searchFilter(req.query.q, ['originalName', 'alt']) || {};
  const [items, total] = await Promise.all([
    Media.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Media.countDocuments(filter),
  ]);
  res.json({ items, meta: pageMeta(total, page, limit) });
});

// The file itself is saved by the upload middleware; this stores its record.
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Choose an image to upload');
  const media = await Media.create({
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    mime: req.file.mimetype,
    size: req.file.size,
  });
  res.status(201).json(media);
});

const updateMedia = asyncHandler(async (req, res) => {
  const media = await Media.findByIdAndUpdate(req.params.id, { alt: String(req.body.alt || '').slice(0, 200) }, { new: true });
  if (!media) throw new HttpError(404, 'File not found');
  res.json(media);
});

const deleteMedia = asyncHandler(async (req, res) => {
  const media = await Media.findByIdAndDelete(req.params.id);
  if (!media) throw new HttpError(404, 'File not found');
  fs.promises.unlink(path.join(UPLOAD_DIR, media.filename)).catch(() => {});
  res.status(204).end();
});

module.exports = { listMedia, uploadMedia, updateMedia, deleteMedia };
