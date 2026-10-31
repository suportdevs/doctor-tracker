const Page = require('../models/Page');
const Menu = require('../models/Menu');
const Message = require('../models/Message');
const { getSettings } = require('../services/settings.service');
const { getLiveData } = require('../services/public.service');
const { publicMessageSchema } = require('../validators/message.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

// Unauthenticated endpoints used by the public website (Next.js). Only public-safe fields are returned.

// Settings + menus every page needs (header, footer, colours…).
const getBootstrap = asyncHandler(async (_req, res) => {
  const [settings, menus] = await Promise.all([getSettings(), Menu.find().lean()]);
  const { admin, ...site } = settings; // eslint-disable-line no-unused-vars
  res.json({
    settings: site,
    menus: Object.fromEntries(menus.map((m) => [m.location, m.items])),
  });
});

// Branding for the admin login screen (read before anyone signs in).
const getAdminBrand = asyncHandler(async (_req, res) => {
  const { admin, general } = await getSettings();
  res.json({ ...admin, logo: general.logo });
});

const getLive = asyncHandler(async (_req, res) => {
  res.json(await getLiveData());
});

const getHomePage = asyncHandler(async (_req, res) => {
  const { general } = await getSettings();
  const page = await Page.findOne({ slug: general.homePage || 'home', status: 'published' }).lean();
  if (!page) throw new HttpError(404, 'Home page not found');
  res.json({ page, live: await getLiveData() });
});

const getPageBySlug = asyncHandler(async (req, res) => {
  const page = await Page.findOne({ slug: String(req.params.slug).toLowerCase(), status: 'published' }).lean();
  if (!page) throw new HttpError(404, 'Page not found');
  res.json({ page, live: await getLiveData() });
});

// Slugs of published pages, for the sitemap.
const listPublishedPages = asyncHandler(async (_req, res) => {
  const items = await Page.find({ status: 'published' }, { slug: 1, updatedAt: 1 }).lean();
  res.json({ items });
});

// Contact and appointment forms.
const sendMessage = asyncHandler(async (req, res) => {
  const { website, ...data } = publicMessageSchema.parse(req.body);
  if (website) return res.status(201).json({ message: 'Thank you!' }); // silently drop bots (honeypot filled)
  if (!data.doctor) delete data.doctor;
  if (!data.preferredDate) delete data.preferredDate;
  await Message.create(data);
  return res.status(201).json({ message: data.kind === 'appointment' ? 'Appointment request received — we will confirm by email.' : 'Thanks! We will get back to you shortly.' });
});

module.exports = { getBootstrap, getAdminBrand, getLive, getHomePage, getPageBySlug, listPublishedPages, sendMessage };
