const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { createRandom, buildDoctors, buildPatients } = require('./data/clinic.data');

const DEMO_PASSWORD = 'Admin@123';
const DEMO_USER = { name: 'Admin User', email: 'admin@doctortracker.dev', role: 'admin' };

async function seedUsers() {
  await User.create({ ...DEMO_USER, password: await bcrypt.hash(DEMO_PASSWORD, 10) });
  console.log(`👤 Admin user created (${DEMO_USER.email} / ${DEMO_PASSWORD})`);
}

async function seedClinic() {
  const random = createRandom(42);
  const doctors = await Doctor.insertMany(buildDoctors(random));
  // Patients are inserted in chunks to keep memory and request size small.
  const patients = buildPatients(random, doctors);
  for (let i = 0; i < patients.length; i += 500) await Patient.insertMany(patients.slice(i, i + 500), { ordered: false });
  console.log(`🩺 ${doctors.length} doctors and ${patients.length} patients created`);
}

// Seeds each area only when it is empty — safe to run on every start.
async function seedIfEmpty() {
  if (!(await User.exists({}))) await seedUsers();
  if (!(await Doctor.exists({}))) await seedClinic();
}

// Wipes demo collections and seeds everything again.
async function seedFresh() {
  await Promise.all([User, Doctor, Patient].map((Model) => Model.deleteMany({})));
  await seedIfEmpty();
}

module.exports = { seedIfEmpty, seedFresh };
