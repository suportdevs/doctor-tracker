const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Each range decides how far back to look and how to group the time series.
const RANGES = {
  '7d': { days: 7, unit: 'day' },
  '30d': { days: 30, unit: 'day' },
  '90d': { days: 90, unit: 'week' },
  '12m': { days: 365, unit: 'month' },
};
const DAY = 24 * 60 * 60 * 1000;
const AGE_LABELS = { 0: '0–17', 18: '18–34', 35: '35–49', 50: '50–64', 65: '65+' };

// Start of the bucket a date falls in — same rules as MongoDB's $dateTrunc in UTC (weeks start on Sunday).
function bucketStart(date, unit) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (unit === 'week') d.setUTCDate(d.getUTCDate() - d.getUTCDay());
  if (unit === 'month') d.setUTCDate(1);
  return d;
}

function nextBucket(date, unit) {
  const d = new Date(date);
  if (unit === 'day') d.setUTCDate(d.getUTCDate() + 1);
  if (unit === 'week') d.setUTCDate(d.getUTCDate() + 7);
  if (unit === 'month') d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

// Counts per time bucket → a continuous series (empty buckets become 0 so charts don't skip days).
function buildSeries(from, unit, patientRows, doctorRows) {
  const patients = new Map(patientRows.map((r) => [r._id.toISOString(), r.count]));
  const doctors = new Map(doctorRows.map((r) => [r._id.toISOString(), r.count]));
  const series = [];
  for (let d = bucketStart(from, unit); d <= new Date(); d = nextBucket(d, unit)) {
    const key = d.toISOString();
    series.push({ date: key, patients: patients.get(key) || 0, doctors: doctors.get(key) || 0 });
  }
  return series;
}

const countByBucket = (Model, field, from, unit) => Model.aggregate([
  { $match: { [field]: { $gte: from } } },
  { $group: { _id: { $dateTrunc: { date: `$${field}`, unit, timezone: 'UTC' } }, count: { $sum: 1 } } },
]);

// Joins the per-doctor counts with doctor names in memory (small: one row per doctor).
function perDoctorRows(perDoctor, doctors) {
  const countById = new Map(perDoctor.map((r) => [String(r._id), r.count]));
  return doctors.map((d) => ({ id: d._id, name: d.name, specialization: d.specialization, photo: d.photo, patients: countById.get(String(d._id)) || 0 }));
}

function bySpecialization(doctorRows) {
  const groups = {};
  for (const d of doctorRows) {
    groups[d.specialization] ||= { specialization: d.specialization, doctors: 0, patients: 0 };
    groups[d.specialization].doctors += 1;
    groups[d.specialization].patients += d.patients;
  }
  return Object.values(groups).sort((a, b) => b.patients - a.patients);
}

// All dashboard analytics in one call. `range` is one of RANGES (defaults to 30d).
async function getDashboardStats(rangeKey) {
  const range = RANGES[rangeKey] ? rangeKey : '30d';
  const { days, unit } = RANGES[range];
  const from = new Date(Date.now() - days * DAY);
  const previousFrom = new Date(from.getTime() - days * DAY);

  const [
    totalDoctors, activeDoctors, totalPatients, newPatients, previousPatients, newDoctors,
    perDoctor, doctors, [breakdown], patientTrend, doctorTrend, recentPatients,
  ] = await Promise.all([
    Doctor.estimatedDocumentCount(),
    Doctor.countDocuments({ status: 'active' }),
    Patient.estimatedDocumentCount(),
    Patient.countDocuments({ visitDate: { $gte: from } }),
    Patient.countDocuments({ visitDate: { $gte: previousFrom, $lt: from } }),
    Doctor.countDocuments({ joinedAt: { $gte: from } }),
    // Patients per doctor: one $group over the { doctor } index.
    Patient.aggregate([{ $group: { _id: '$doctor', count: { $sum: 1 } } }]),
    Doctor.find({}, { name: 1, specialization: 1, photo: 1 }).lean(),
    // Several breakdowns of the patients collection in a single round trip.
    Patient.aggregate([{
      $facet: {
        conditions: [{ $group: { _id: '$condition', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        genders: [{ $group: { _id: '$gender', count: { $sum: 1 } } }],
        ageGroups: [{ $bucket: { groupBy: '$age', boundaries: [0, 18, 35, 50, 65, 131], default: 'other', output: { count: { $sum: 1 } } } }],
        critical: [{ $match: { condition: 'critical' } }, { $count: 'count' }],
      },
    }]),
    countByBucket(Patient, 'visitDate', from, unit),
    countByBucket(Doctor, 'joinedAt', from, unit),
    Patient.find().sort({ visitDate: -1 }).limit(6).populate('doctor', 'name specialization photo').lean(),
  ]);

  const doctorRows = perDoctorRows(perDoctor, doctors);

  return {
    range,
    unit,
    totals: {
      doctors: totalDoctors,
      activeDoctors,
      patients: totalPatients,
      newPatients,
      newDoctors,
      patientGrowth: previousPatients ? Math.round(((newPatients - previousPatients) / previousPatients) * 100) : null,
      avgPatientsPerDoctor: totalDoctors ? Math.round((totalPatients / totalDoctors) * 10) / 10 : 0,
      critical: breakdown.critical[0]?.count || 0,
    },
    patientsPerDoctor: [...doctorRows].sort((a, b) => b.patients - a.patients).slice(0, 10),
    specializations: bySpecialization(doctorRows),
    conditions: breakdown.conditions.map((c) => ({ condition: c._id, count: c.count })),
    genders: breakdown.genders.map((g) => ({ gender: g._id, count: g.count })),
    ageGroups: breakdown.ageGroups.map((a) => ({ group: AGE_LABELS[a._id] || 'Other', count: a.count })),
    trend: buildSeries(from, unit, patientTrend, doctorTrend),
    recentPatients,
  };
}

module.exports = { getDashboardStats };
