const Page = require('../models/Page');
const { cleanBlocks, uniqueSlug } = require('../services/page.service');
const { pageSchema } = require('../validators/page.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { paginate, pageMeta } = require('../utils/pagination');
const { searchFilter } = require('../utils/queryFilters');

const listPages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 20);
  const filter = searchFilter(req.query.q, ['title', 'slug']) || {};
  if (['draft', 'published'].includes(req.query.status)) filter.status = req.query.status;
  const [items, total] = await Promise.all([
    Page.find(filter, { blocks: 0 }).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
    Page.countDocuments(filter),
  ]);
  res.json({ items, meta: pageMeta(total, page, limit) });
});

const getPage = asyncHandler(async (req, res) => {
  const page = await Page.findById(req.params.id).lean();
  if (!page) throw new HttpError(404, 'Page not found');
  res.json(page);
});

const createPage = asyncHandler(async (req, res) => {
  const { slug, blocks, ...data } = pageSchema.parse(req.body);
  const page = await Page.create({ ...data, blocks: cleanBlocks(blocks), slug: await uniqueSlug(slug || data.title) });
  res.status(201).json(page);
});

const updatePage = asyncHandler(async (req, res) => {
  const { slug, blocks, ...data } = pageSchema.partial().parse(req.body);
  if (blocks) data.blocks = cleanBlocks(blocks);
  if (slug !== undefined) data.slug = await uniqueSlug(slug || data.title || 'page', req.params.id);
  const page = await Page.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!page) throw new HttpError(404, 'Page not found');
  res.json(page);
});

const duplicatePage = asyncHandler(async (req, res) => {
  const source = await Page.findById(req.params.id).lean();
  if (!source) throw new HttpError(404, 'Page not found');
  const title = `${source.title} (copy)`;
  const page = await Page.create({ title, slug: await uniqueSlug(title), blocks: source.blocks, status: 'draft', seoTitle: source.seoTitle, seoDescription: source.seoDescription });
  res.status(201).json(page);
});

const deletePage = asyncHandler(async (req, res) => {
  const page = await Page.findByIdAndDelete(req.params.id);
  if (!page) throw new HttpError(404, 'Page not found');
  res.status(204).end();
});

module.exports = { listPages, getPage, createPage, updatePage, duplicatePage, deletePage };
