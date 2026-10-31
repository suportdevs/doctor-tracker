const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { withPatientCounts } = require('../services/doctor.service');
const { listPatients } = require('../services/patient.service');
const { doctorSchema } = require('../validators/doctor.validator');
const { patientSchema } = require('../validators/patient.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');
const { paginate, pageMeta } = require('../utils/pagination');
const { searchFilter, dateRange } = require('../utils/queryFilters');

const SORTS = {
  newest: { joinedAt: -1 },
  oldest: { joinedAt: 1 },
  name: { name: 1 },
};

// GET /api/doctors?q=&specialization=&hospital=&status=&from=&to=&sort=&page=&limit=
const listDoctors = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = {};
  const search = searchFilter(req.query.q, ['name', 'email', 'phone', 'specialization', 'hospital']);
  if (search) Object.assign(filter, search);
  if (req.query.specialization) filter.specialization = String(req.query.specialization);
  if (req.query.hospital) filter.hospital = String(req.query.hospital);
  if (['active', 'inactive'].includes(req.query.status)) filter.status = req.query.status;
  const joined = dateRange(req.query.from, req.query.to);
  if (joined) filter.joinedAt = joined;

  // The page of results and the total count run in parallel.
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(SORTS[req.query.sort] || SORTS.newest).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);
  res.json({ items: await withPatientCounts(doctors), meta: pageMeta(total, page, limit) });
});

// GET /api/doctors/options — small list for "choose a doctor" selects.
const listOptions = asyncHandler(async (_req, res) => {
  const items = await Doctor.find({}, { name: 1, specialization: 1 }).sort({ name: 1 }).lean();
  res.json({ items });
});

// GET /api/doctors/filters — values for the filter dropdowns (distinct uses the indexes on these fields).
const listFilterValues = asyncHandler(async (_req, res) => {
  const [specializations, hospitals] = await Promise.all([Doctor.distinct('specialization'), Doctor.distinct('hospital')]);
  res.json({ specializations: specializations.sort(), hospitals: hospitals.sort() });
});

const getDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id).lean();
  if (!doctor) throw new HttpError(404, 'Doctor not found');
  const [withCount] = await withPatientCounts([doctor]);
  res.json(withCount);
});

const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.create(doctorSchema.parse(req.body));
  res.status(201).json(doctor);
});

const updateDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, doctorSchema.partial().parse(req.body), { new: true, runValidators: true });
  if (!doctor) throw new HttpError(404, 'Doctor not found');
  res.json(doctor);
});

// A doctor with patients can't be deleted — patients would be left without a doctor.
const deleteDoctor = asyncHandler(async (req, res) => {
  const patients = await Patient.countDocuments({ doctor: req.params.id });
  if (patients) throw new HttpError(409, `This doctor still has ${patients} patient(s). Move or delete them first.`);
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) throw new HttpError(404, 'Doctor not found');
  res.status(204).end();
});

/* ---------- Patients of one doctor ---------- */

const listDoctorPatients = asyncHandler(async (req, res) => {
  res.json(await listPatients({ ...req.query, doctor: req.params.id }));
});

const addDoctorPatient = asyncHandler(async (req, res) => {
  if (!(await Doctor.exists({ _id: req.params.id }))) throw new HttpError(404, 'Doctor not found');
  const patient = await Patient.create(patientSchema.parse({ ...req.body, doctor: req.params.id }));
  res.status(201).json(patient);
});

const removeDoctorPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findOneAndDelete({ _id: req.params.patientId, doctor: req.params.id });
  if (!patient) throw new HttpError(404, 'Patient not found for this doctor');
  res.status(204).end();
});

module.exports = {
  listDoctors, listOptions, listFilterValues, getDoctor, createDoctor, updateDoctor, deleteDoctor,
  listDoctorPatients, addDoctorPatient, removeDoctorPatient,
};
