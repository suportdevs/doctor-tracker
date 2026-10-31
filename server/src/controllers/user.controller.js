const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { userSchema } = require('../validators/user.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { paginate, pageMeta } = require('../utils/pagination');
const { searchFilter } = require('../utils/queryFilters');

const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query, 20);
  const filter = searchFilter(req.query.q, ['name', 'email']) || {};
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);
  res.json({ items, meta: pageMeta(total, page, limit) });
});

const createUser = asyncHandler(async (req, res) => {
  const data = userSchema.parse(req.body);
  if (!data.password) throw new HttpError(422, 'password: Password is required');
  const user = await User.create({ ...data, password: await bcrypt.hash(data.password, 10) });
  res.status(201).json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const data = userSchema.partial().parse(req.body);
  const isSelf = String(req.user._id) === req.params.id;
  // Guard against locking yourself out.
  if (isSelf && (data.isActive === false || (data.role && data.role !== req.user.role))) {
    throw new HttpError(400, 'You cannot disable your own account or change your own role');
  }
  if (data.password) data.password = await bcrypt.hash(data.password, 10);
  else delete data.password;
  const user = await User.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!user) throw new HttpError(404, 'User not found');
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.user._id) === req.params.id) throw new HttpError(400, 'You cannot delete your own account');
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new HttpError(404, 'User not found');
  res.status(204).end();
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
