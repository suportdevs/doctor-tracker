const Menu = require('../models/Menu');
const { menuSchema, createMenuSchema } = require('../validators/menu.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const slugify = require('../utils/slugify');

// Built-in menus always exist (they can be emptied but not deleted). Editors can add more menus
// and choose in Site settings which menu shows in the header and footer.
const BUILT_IN = { header: 'Header menu', footer: 'Footer menu' };

// Built-ins first (even ones never saved), then custom menus in the order they were created.
const listMenus = asyncHandler(async (_req, res) => {
  const menus = await Menu.find().sort({ createdAt: 1 }).lean();
  const builtIn = Object.entries(BUILT_IN).map(([location, name]) => ({
    ...(menus.find((m) => m.location === location) || { location, name, items: [] }),
    builtIn: true,
  }));
  const custom = menus.filter((m) => !BUILT_IN[m.location]).map((m) => ({ ...m, builtIn: false }));
  res.json({ items: [...builtIn, ...custom] });
});

// POST /api/menus { name } — the key ("location") is made from the name, e.g. "Quick links" → "quick-links".
const createMenu = asyncHandler(async (req, res) => {
  const { name } = createMenuSchema.parse(req.body);
  const base = slugify(name);
  let location = base;
  for (let i = 1; BUILT_IN[location] || (await Menu.exists({ location })); i++) location = `${base}-${i}`;
  const menu = await Menu.create({ location, name, items: [] });
  res.status(201).json({ ...menu.toObject(), builtIn: false });
});

// Replaces the whole item list — simplest way to save re-ordering. Custom menus can also be renamed.
const saveMenu = asyncHandler(async (req, res) => {
  const { location } = req.params;
  const existing = await Menu.findOne({ location }).lean();
  if (!BUILT_IN[location] && !existing) throw new HttpError(404, 'Menu not found');
  const { items, name } = menuSchema.parse(req.body);
  const menuName = BUILT_IN[location] || name || existing.name;
  const menu = await Menu.findOneAndUpdate({ location }, { name: menuName, items }, { new: true, upsert: true, runValidators: true }).lean();
  res.json({ ...menu, builtIn: !!BUILT_IN[location] });
});

const deleteMenu = asyncHandler(async (req, res) => {
  const { location } = req.params;
  if (BUILT_IN[location]) throw new HttpError(409, 'Built-in menus can’t be deleted — remove their links instead.');
  const menu = await Menu.findOneAndDelete({ location });
  if (!menu) throw new HttpError(404, 'Menu not found');
  res.status(204).end();
});

module.exports = { listMenus, createMenu, saveMenu, deleteMenu, BUILT_IN };
