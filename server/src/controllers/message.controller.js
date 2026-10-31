const Message = require('../models/Message');
const { messageStatusSchema } = require('../validators/message.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { paginate, pageMeta } = require('../utils/pagination');
const { searchFilter } = require('../utils/queryFilters');

const listMessages = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 15);
  const filter = searchFilter(req.query.q, ['name', 'email', 'subject', 'message']) || {};
  if (['unread', 'read', 'replied'].includes(req.query.status)) filter.status = req.query.status;
  if (['contact', 'appointment'].includes(req.query.kind)) filter.kind = req.query.kind;
  const [items, total, unread] = await Promise.all([
    Message.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('doctor', 'name specialization').lean(),
    Message.countDocuments(filter),
    Message.countDocuments({ status: 'unread' }),
  ]);
  res.json({ items, meta: pageMeta(total, page, limit), unread });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = messageStatusSchema.parse(req.body);
  const message = await Message.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!message) throw new HttpError(404, 'Message not found');
  res.json(message);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) throw new HttpError(404, 'Message not found');
  res.status(204).end();
});

module.exports = { listMessages, updateStatus, deleteMessage };
