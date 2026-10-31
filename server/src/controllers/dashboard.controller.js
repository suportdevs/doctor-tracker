const { getDashboardStats } = require('../services/dashboard.service');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard?range=7d|30d|90d|12m
const getStats = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'private, max-age=15');
  res.json(await getDashboardStats(req.query.range));
});

module.exports = { getStats };
