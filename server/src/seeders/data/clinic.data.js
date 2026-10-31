// Demo clinic data: a fixed team of doctors (with real photos) and patients generated with a
// seeded random generator, so every seed produces the same records.
// Doctor photos live in client/public/images/doctors (Unsplash + randomuser.me portraits).

// Small seeded random generator so every seed produces the same demo data.
function createRandom(seed = 42) {
  let a = seed;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (list) => list[Math.floor(next() * list.length)],
  };
}

const HOSPITALS = {
  city: 'City General Hospital',
  stmary: 'St. Mary Medical Center',
  green: 'Green Valley Clinic',
  river: 'Riverside Hospital',
  sunrise: 'Sunrise Health Institute',
  north: 'Northside Children’s Hospital',
};

// [name, specialization, hospital key, status]. The first 15 are the senior team: they joined
// earliest, so the website's "Meet our doctors" section (oldest first) shows them.
const TEAM = [
  ['Sarah Mitchell', 'Cardiology', 'city'],
  ['Arjun Mehta', 'Neurology', 'stmary'],
  ['Amara Okafor', 'Pediatrics', 'north'],
  ['James Whitaker', 'Orthopedics', 'river'],
  ['Nadia Rahman', 'Dermatology', 'sunrise'],
  ['Linda Hartmann', 'Oncology', 'stmary'],
  ['Marcus Reed', 'General Medicine', 'city'],
  ['Zara Mensah', 'Gynecology', 'green'],
  ['Lukas Weber', 'Psychiatry', 'river'],
  ['Kevin Zhang', 'ENT', 'sunrise'],
  ['Priya Raman', 'Endocrinology', 'green'],
  ['William Foster', 'Cardiology', 'stmary'],
  ['Elena Rossi', 'Orthopedics', 'city'],
  ['David Okonkwo', 'Pediatrics', 'north'],
  ['Ananya Sharma', 'General Medicine', 'green'],
  ['Grace Lin', 'Ophthalmology', 'sunrise'],
  ['Oliver Bennett', 'Neurology', 'city'],
  ['Hannah Cole', 'Pediatrics', 'north'],
  ['Daniel Tan', 'Ophthalmology', 'river'],
  ['Rajesh Iyer', 'Cardiology', 'river'],
  ['Emily Carter', 'Dermatology', 'green'],
  ['Carlos Medina', 'Orthopedics', 'stmary'],
  ['Isabel Moreno', 'Gynecology', 'stmary'],
  ['Thomas Keller', 'Oncology', 'city'],
  ['Naomi Adeyemi', 'Psychiatry', 'sunrise'],
  ['Ethan Brooks', 'General Medicine', 'river'],
  ['Maria Santos', 'Endocrinology', 'city'],
  ['Omar Haddad', 'ENT', 'stmary'],
  ['Claire Dubois', 'Neurology', 'river'],
  ['Robert Hayes', 'Oncology', 'river', 'inactive'],
  ['Sophie Laurent', 'Ophthalmology', 'city'],
  ['Samuel Price', 'Psychiatry', 'green'],
  ['Karen Fischer', 'Endocrinology', 'stmary', 'inactive'],
  ['Adrian Novak', 'ENT', 'city'],
  ['Yuna Kim', 'Dermatology', 'sunrise'],
  ['Henry Walsh', 'General Medicine', 'stmary', 'inactive'],
  ['Leila Karimi', 'Gynecology', 'river'],
  ['Michael Grant', 'Cardiology', 'green', 'inactive'],
  ['Rachel Stein', 'Psychiatry', 'city'],
  ['Nathan Hughes', 'Neurology', 'green'],
];
const SENIOR_COUNT = 15;

// Per specialty: typical diagnoses and the usual patient age range.
const SPECIALTIES = {
  Cardiology: { ages: [38, 88], diagnoses: ['Hypertension', 'Atrial fibrillation', 'Coronary artery disease', 'Heart failure', 'Chest pain evaluation', 'High cholesterol'] },
  Neurology: { ages: [18, 85], diagnoses: ['Migraine', 'Epilepsy', 'Parkinson’s disease', 'Peripheral neuropathy', 'Post-stroke care', 'Multiple sclerosis'] },
  Pediatrics: { ages: [0, 17], diagnoses: ['Asthma', 'Bronchiolitis', 'Ear infection', 'Growth check-up', 'Childhood vaccination', 'Tonsillitis'] },
  Orthopedics: { ages: [16, 82], diagnoses: ['Wrist fracture', 'Knee osteoarthritis', 'ACL tear', 'Lower back pain', 'Rotator cuff injury', 'Hip replacement follow-up'] },
  Dermatology: { ages: [14, 75], diagnoses: ['Eczema', 'Psoriasis', 'Acne', 'Contact dermatitis', 'Mole check', 'Rosacea'] },
  Oncology: { ages: [32, 84], diagnoses: ['Breast cancer', 'Lymphoma', 'Lung cancer', 'Colon cancer screening', 'Chemotherapy follow-up', 'Prostate cancer'] },
  'General Medicine': { ages: [18, 90], diagnoses: ['Influenza', 'Type 2 diabetes', 'Annual check-up', 'Iron-deficiency anemia', 'Urinary tract infection', 'Seasonal allergies'] },
  Gynecology: { ages: [18, 65], diagnoses: ['Prenatal care', 'PCOS', 'Endometriosis', 'Routine exam', 'Menopause care', 'Postnatal check-up'] },
  Psychiatry: { ages: [16, 78], diagnoses: ['Generalized anxiety', 'Depression', 'Insomnia', 'ADHD', 'Panic disorder', 'Bipolar disorder'] },
  ENT: { ages: [4, 80], diagnoses: ['Chronic sinusitis', 'Tonsillitis', 'Hearing loss', 'Vertigo', 'Tinnitus', 'Deviated septum'] },
  Ophthalmology: { ages: [8, 90], diagnoses: ['Cataract', 'Glaucoma', 'Myopia', 'Conjunctivitis', 'Diabetic retinopathy', 'Dry eye'] },
  Endocrinology: { ages: [20, 82], diagnoses: ['Hypothyroidism', 'Type 1 diabetes', 'Osteoporosis', 'Obesity management', 'Hyperthyroidism', 'Adrenal insufficiency'] },
};

const FEMALE = ['Olivia', 'Emma', 'Ava', 'Sophia', 'Mia', 'Amelia', 'Harper', 'Ella', 'Chloe', 'Lily', 'Aisha', 'Fatima', 'Priya', 'Mei', 'Yuki', 'Sara', 'Nadia', 'Elena', 'Grace', 'Zara', 'Layla', 'Hana', 'Maya', 'Leah', 'Ruby', 'Nora', 'Ines', 'Amira', 'Sofia', 'Chiara', 'Ayesha', 'Tanvi', 'Keiko', 'Ama', 'Lucia', 'Freya'];
const MALE = ['Liam', 'Noah', 'Ethan', 'Lucas', 'Mason', 'Logan', 'Elijah', 'Omar', 'Arjun', 'Rahim', 'Chen', 'Hiro', 'David', 'Karim', 'Mateo', 'Leo', 'Isaac', 'Adam', 'Samuel', 'Jacob', 'Daniel', 'Ryan', 'Tariq', 'Kofi', 'Diego', 'Marco', 'Felix', 'Hugo', 'Ibrahim', 'Kenji', 'Ravi', 'Tomas', 'Yusuf', 'Andre', 'Ben', 'Jonah'];
const LAST = ['Smith', 'Johnson', 'Brown', 'Khan', 'Rahman', 'Patel', 'Garcia', 'Martinez', 'Lee', 'Wang', 'Kim', 'Nguyen', 'Hossain', 'Ahmed', 'Rossi', 'Muller', 'Silva', 'Cohen', 'Tanaka', 'Novak', 'Haddad', 'Okafor', 'Clarke', 'Walker', 'Fernandes', 'Jensen', 'Murphy', 'Costa', 'Ali', 'Chowdhury', 'Sato', 'Becker', 'Dubois', 'Mensah', 'Reyes', 'Evans', 'Turner', 'Singh', 'Lopez', 'Hughes'];

// Short clinical notes, picked by the patient's condition.
const NOTES = {
  stable: ['Vitals normal. Routine follow-up in 3 months.', 'Responding well to current medication.', 'No new symptoms reported.'],
  recovering: ['Improving steadily — continue treatment plan.', 'Physiotherapy twice a week.', 'Review progress at next visit in 2 weeks.'],
  under_observation: ['Awaiting lab results.', 'Monitor symptoms daily and report changes.', 'Referred for imaging (MRI).'],
  critical: ['Admitted — needs close monitoring.', 'Specialist consult requested urgently.', 'Medication adjusted; recheck in 24 hours.'],
  discharged: ['Treatment completed. Discharged in good health.', 'Discharged with home-care instructions.', 'No further visits needed.'],
};
const CONDITION_WEIGHTS = [['stable', 40], ['recovering', 25], ['under_observation', 15], ['discharged', 12], ['critical', 8]];

const DAY = 24 * 60 * 60 * 1000;
const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '-');
const phoneNumber = (random) => `+1 555 ${random.int(100, 999)} ${random.int(1000, 9999)}`;

function weighted(random, pairs) {
  const total = pairs.reduce((sum, [, w]) => sum + w, 0);
  let roll = random.next() * total;
  for (const [value, w] of pairs) {
    roll -= w;
    if (roll <= 0) return value;
  }
  return pairs[0][0];
}

function buildDoctors(random) {
  return TEAM.map(([name, specialization, hospital, status = 'active'], i) => ({
    name: `Dr. ${name}`,
    specialization,
    hospital: HOSPITALS[hospital],
    phone: phoneNumber(random),
    email: `${slug(name).replace('-', '.')}@doctortracker.dev`,
    photo: `/images/doctors/${slug(name)}.jpg`,
    status,
    // Senior team joined 13–18 months ago; everyone else within the last year.
    joinedAt: new Date(Date.now() - (i < SENIOR_COUNT ? random.int(390, 540) : random.int(2, 370)) * DAY),
  }));
}

function buildPatients(random, doctors, count = 1800) {
  return Array.from({ length: count }, () => {
    // The senior team sees more patients, so "patients per doctor" isn't flat.
    const doctor = random.next() < 0.35 ? doctors[random.int(0, SENIOR_COUNT - 1)] : random.pick(doctors);
    const { ages, diagnoses } = SPECIALTIES[doctor.specialization];
    // Gynecology patients are women; everyone else is a realistic mix.
    const gender = doctor.specialization === 'Gynecology' ? 'female' : (random.next() < 0.02 ? 'other' : random.pick(['male', 'female']));
    const first = random.pick(gender === 'male' ? MALE : gender === 'female' ? FEMALE : [...FEMALE, ...MALE]);
    const last = random.pick(LAST);
    const condition = weighted(random, CONDITION_WEIGHTS);
    // More visits in recent months, so the trend chart shows growth.
    const daysAgo = Math.floor(365 * random.next() ** 1.6);
    return {
      name: `${first} ${last}`,
      age: random.int(ages[0], ages[1]),
      gender,
      phone: phoneNumber(random),
      email: random.next() < 0.7 ? `${first}.${last}${random.int(1, 99)}@mail.com`.toLowerCase() : '',
      condition,
      diagnosis: random.pick(diagnoses),
      notes: random.next() < 0.6 ? random.pick(NOTES[condition]) : '',
      doctor: doctor._id,
      visitDate: new Date(Date.now() - daysAgo * DAY - random.int(0, 23) * 60 * 60 * 1000),
    };
  });
}

module.exports = { createRandom, buildDoctors, buildPatients };
