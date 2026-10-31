const Setting = require('../models/Setting');
const { DEFAULT_SETTINGS, getSettings, saveGroup } = require('../services/settings.service');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

const checkGroup = (group) => {
  if (!DEFAULT_SETTINGS[group]) throw new HttpError(404, `Unknown settings group "${group}"`);
  return group;
};

const getAllSettings = asyncHandler(async (_req, res) => {
  res.json(await getSettings());
});

const updateGroup = asyncHandler(async (req, res) => {
  const group = checkGroup(req.params.group);
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) throw new HttpError(422, 'Settings must be an object');
  await saveGroup(group, req.body);
  res.json(await getSettings());
});

const resetGroup = asyncHandler(async (req, res) => {
  const group = checkGroup(req.params.group);
  await Setting.deleteOne({ key: group });
  res.json(await getSettings());
});

module.exports = { getAllSettings, updateGroup, resetGroup };
