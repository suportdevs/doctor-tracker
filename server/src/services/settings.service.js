const Setting = require('../models/Setting');

// Default values for every settings group. Stored values are merged over these, so adding a
// new option here makes it available everywhere without touching the database.
const DEFAULT_SETTINGS = {
  general: {
    siteName: 'Doctor Tracker',
    tagline: 'Care that keeps track of you.',
    logo: '',
    favicon: '',
    homePage: 'home', // slug of the page shown at "/"
  },
  appearance: {
    primaryColor: '#147c61',
    accentColor: '#c4ee5c',
    radius: 16,
    headerCta: { enabled: true, label: 'Book appointment', url: '/contact' },
    announcement: { enabled: true, text: '24/7 emergency care — call our hotline any time.', linkLabel: 'Contact us', url: '/contact' },
    footerText: 'Compassionate care, tracked with precision.',
    // Which menu (by key) shows in the header and footer — see Admin → Menus.
    headerMenu: 'header',
    footerMenu: 'footer',
  },
  contact: {
    email: 'hello@doctortracker.dev',
    phone: '+1 (555) 010-2030',
    emergencyPhone: '+1 (555) 911-0000',
    address: '42 Wellness Avenue, Springfield',
    hours: 'Mon – Sat, 8:00 – 20:00',
  },
  social: { facebook: 'https://facebook.com', twitter: '', instagram: 'https://instagram.com', linkedin: 'https://linkedin.com', youtube: '' },
  seo: {
    metaTitle: 'Doctor Tracker — Modern clinic care',
    metaDescription: 'Find the right specialist, book an appointment and get care from a team that keeps track of you.',
    ogImage: '/images/site/hero-doctor.jpg',
  },
  // Admin panel branding (sidebar name and login screen).
  admin: {
    appName: 'Doctor Tracker',
    loginTitle: 'Every doctor, every patient,',
    loginHighlight: 'one clear view.',
    loginText: 'Manage doctors and patients, see live analytics and edit your public website — all from one secure dashboard.',
  },
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

function deepMerge(base, override) {
  if (!isObject(base) || !isObject(override)) return override === undefined ? base : override;
  const out = { ...base };
  for (const [key, value] of Object.entries(override)) out[key] = isObject(base[key]) ? deepMerge(base[key], value) : value;
  return out;
}

async function getSettings() {
  const rows = await Setting.find().lean();
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const result = {};
  for (const group of Object.keys(DEFAULT_SETTINGS)) result[group] = deepMerge(DEFAULT_SETTINGS[group], stored[group] || {});
  return result;
}

// Only keys that exist in the defaults are saved, so unknown fields can't sneak into the database.
function pickKnown(base, value) {
  const out = {};
  for (const key of Object.keys(base)) {
    if (value[key] === undefined) continue;
    out[key] = isObject(base[key]) && isObject(value[key]) ? pickKnown(base[key], value[key]) : value[key];
  }
  return out;
}

async function saveGroup(group, value) {
  const current = await Setting.findOne({ key: group }).lean();
  const merged = deepMerge(current?.value || {}, pickKnown(DEFAULT_SETTINGS[group], value || {}));
  await Setting.updateOne({ key: group }, { $set: { value: merged } }, { upsert: true });
}

module.exports = { DEFAULT_SETTINGS, getSettings, saveGroup };
