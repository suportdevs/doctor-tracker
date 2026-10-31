const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Page = require('../models/Page');
const Menu = require('../models/Menu');
const { PAGES, DEMO_PAGES, MENUS } = require('./data/website.data');
const { createRandom, buildDoctors, buildPatients } = require('./data/clinic.data');

const DEMO_PASSWORD = 'Admin@123';
const DEMO_USERS = [
  { name: 'Admin User', email: 'admin@doctortracker.dev', role: 'admin' },
  { name: 'Clinic Manager', email: 'manager@doctortracker.dev', role: 'manager' },
  { name: 'Website Editor', email: 'editor@doctortracker.dev', role: 'editor' },
];

async function seedUsers() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  await User.insertMany(DEMO_USERS.map((u) => ({ ...u, password })));
  console.log(`👤 Users created (password: ${DEMO_PASSWORD})`);
}

async function seedClinic() {
  const random = createRandom(42);
  const doctors = await Doctor.insertMany(buildDoctors(random));
  // Patients are inserted in chunks to keep memory and request size small.
  const patients = buildPatients(random, doctors);
  for (let i = 0; i < patients.length; i += 500) await Patient.insertMany(patients.slice(i, i + 500), { ordered: false });
  console.log(`🩺 ${doctors.length} doctors and ${patients.length} patients created`);
}

async function seedWebsite() {
  await Page.insertMany(PAGES);
  console.log(`🌐 ${PAGES.length} website pages created`);
}

// Adds any demo home page design that doesn't exist yet (by slug), without touching other pages.
async function seedMissingDemoPages() {
  for (const page of DEMO_PAGES) {
    if (await Page.exists({ slug: page.slug })) continue;
    await Page.create(page);
    console.log(`🎨 Demo page "${page.title}" created`);
  }
}

// Adds any demo menu that doesn't exist yet (never overwrites a menu an editor has changed).
async function seedMissingMenus() {
  for (const menu of MENUS) {
    if (await Menu.exists({ location: menu.location })) continue;
    await Menu.create(menu);
    console.log(`🧭 ${menu.name} created`);
  }
}

// Seeds each area only when it is empty — safe to run on every start.
async function seedIfEmpty() {
  if (!(await User.exists({}))) await seedUsers();
  if (!(await Doctor.exists({}))) await seedClinic();
  if (!(await Page.exists({}))) await seedWebsite();
  await seedMissingDemoPages();
  await seedMissingMenus();
}

// Wipes demo collections and seeds everything again.
async function seedFresh() {
  await Promise.all([User, Doctor, Patient, Page, Menu].map((Model) => Model.deleteMany({})));
  await seedIfEmpty();
}

module.exports = { seedIfEmpty, seedFresh };
