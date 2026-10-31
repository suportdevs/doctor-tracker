const mongoose = require('mongoose');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { CONDITIONS, GENDERS } = require('../constants/patient');
const HttpError = require('../utils/HttpError');
const { paginate, pageMeta } = require('../utils/pagination');
const { searchFilter, dateRange } = require('../utils/queryFilters');

const SORTS = {
  newest: { visitDate: -1 },
  oldest: { visitDate: 1 },
  name: { name: 1 },
  age: { age: -1 },
};
const DOCTOR_FIELDS = 'name specialization hospital photo';

// Shared by /api/patients and /api/doctors/:id/patients.
// Query: q, condition, gender, doctor, from, to (visit date), minAge, maxAge, sort, page, limit
async function listPatients(query) {
  const { page, limit, skip } = paginate(query);
  const filter = {};
  const search = searchFilter(query.q, ['name', 'email', 'phone', 'diagnosis']);
  if (search) Object.assign(filter, search);
  if (CONDITIONS.includes(query.condition)) filter.condition = query.condition;
  if (GENDERS.includes(query.gender)) filter.gender = query.gender;
  if (query.doctor && mongoose.isValidObjectId(query.doctor)) filter.doctor = new mongoose.Types.ObjectId(String(query.doctor));
  const visit = dateRange(query.from, query.to);
  if (visit) filter.visitDate = visit;
  const minAge = parseInt(query.minAge, 10);
  const maxAge = parseInt(query.maxAge, 10);
  if (!Number.isNaN(minAge) || !Number.isNaN(maxAge)) {
    filter.age = {};
    if (!Number.isNaN(minAge)) filter.age.$gte = minAge;
    if (!Number.isNaN(maxAge)) filter.age.$lte = maxAge;
  }

  const [items, total] = await Promise.all([
    Patient.find(filter)
      .sort(SORTS[query.sort] || SORTS.newest)
      .skip(skip)
      .limit(limit)
      .populate('doctor', DOCTOR_FIELDS) // one extra query for the whole page ($in on doctor ids)
      .lean(),
    Patient.countDocuments(filter),
  ]);
  return { items, meta: pageMeta(total, page, limit) };
}

// A patient can only be assigned to a doctor that exists.
async function ensureDoctorExists(id) {
  if (id && !(await Doctor.exists({ _id: id }))) throw new HttpError(422, 'doctor: Selected doctor does not exist');
}

module.exports = { listPatients, ensureDoctorExists, DOCTOR_FIELDS };
