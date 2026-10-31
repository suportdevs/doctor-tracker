const Patient = require('../models/Patient');

// Adds patientCount to a list of doctors with ONE grouped query (not one count per doctor).
async function withPatientCounts(doctors) {
  const counts = await Patient.aggregate([
    { $match: { doctor: { $in: doctors.map((d) => d._id) } } },
    { $group: { _id: '$doctor', count: { $sum: 1 } } },
  ]);
  const byId = new Map(counts.map((c) => [String(c._id), c.count]));
  return doctors.map((d) => ({ ...d, patientCount: byId.get(String(d._id)) || 0 }));
}

module.exports = { withPatientCounts };
