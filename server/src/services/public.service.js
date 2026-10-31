const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// Live numbers for dynamic website blocks (stats, doctor cards, specialties). Cached in memory for a
// minute so heavy website traffic doesn't hit the database on every page view.
const CACHE_MS = 60 * 1000;
let cache = { at: 0, data: null };

async function getLiveData() {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  const [doctors, patients, specialties, hospitals, team] = await Promise.all([
    Doctor.countDocuments({ status: 'active' }),
    Patient.estimatedDocumentCount(),
    Doctor.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$specialization', doctors: { $sum: 1 } } },
      { $sort: { doctors: -1, _id: 1 } },
    ]),
    Doctor.distinct('hospital', { status: 'active' }),
    // Longest-serving doctors first, so the website leads with the senior team.
    Doctor.find({ status: 'active' }, { name: 1, specialization: 1, hospital: 1, photo: 1, joinedAt: 1 }).sort({ joinedAt: 1 }).limit(24).lean(),
  ]);
  const data = {
    stats: { doctors, patients, specialties: specialties.length, hospitals: hospitals.length },
    specialties: specialties.map((s) => ({ name: s._id, doctors: s.doctors })),
    doctors: team,
  };
  cache = { at: Date.now(), data };
  return data;
}

module.exports = { getLiveData };
