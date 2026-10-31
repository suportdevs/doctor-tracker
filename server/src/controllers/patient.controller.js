const Patient = require('../models/Patient');
const { listPatients, ensureDoctorExists, DOCTOR_FIELDS } = require('../services/patient.service');
const { patientSchema } = require('../validators/patient.validator');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/HttpError');

// GET /api/patients?q=&condition=&gender=&doctor=&from=&to=&minAge=&maxAge=&sort=&page=&limit=
const getPatients = asyncHandler(async (req, res) => {
  res.json(await listPatients(req.query));
});

const getPatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id).populate('doctor', DOCTOR_FIELDS).lean();
  if (!patient) throw new HttpError(404, 'Patient not found');
  res.json(patient);
});

const createPatient = asyncHandler(async (req, res) => {
  const data = patientSchema.parse(req.body);
  await ensureDoctorExists(data.doctor);
  const patient = await Patient.create(data);
  res.status(201).json(patient);
});

const updatePatient = asyncHandler(async (req, res) => {
  const data = patientSchema.partial().parse(req.body);
  await ensureDoctorExists(data.doctor);
  const patient = await Patient.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('doctor', DOCTOR_FIELDS);
  if (!patient) throw new HttpError(404, 'Patient not found');
  res.json(patient);
});

const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) throw new HttpError(404, 'Patient not found');
  res.status(204).end();
});

module.exports = { getPatients, getPatient, createPatient, updatePatient, deletePatient };
