// Demo website content: pages built from blocks + header/footer menus.
// Block types and their fields are defined in client/src/config/blocks.js.
let n = 0;
const block = (type, data, style = {}) => ({ id: `seed-${type}-${++n}`, type, data, style });

const PAGES = [
  {
    title: 'Home',
    slug: 'home',
    seoTitle: 'Doctor Tracker — Modern clinic care',
    seoDescription: 'Specialist doctors, fast appointments and care that keeps track of you.',
    blocks: [
      block('hero', {
        variant: 'split',
        eyebrow: 'Trusted by thousands of families',
        title: 'Specialist care that keeps track of you',
        subtitle: 'Find the right doctor, book a visit in minutes and let our care team follow your recovery every step of the way.',
        primaryLabel: 'Book an appointment',
        primaryUrl: '/contact',
        secondaryLabel: 'Meet our doctors',
        secondaryUrl: '/doctors',
        image: '/images/site/hero-doctor.jpg',
        badges: ['Same-day visits', '24/7 emergency line', 'Digital records'],
      }),
      block('stats', { source: 'live', title: '', items: [] }, { background: 'muted', spacing: 'compact' }),
      block('features', {
        eyebrow: 'Why patients choose us',
        title: 'Care designed around you',
        subtitle: 'Modern medicine, a friendly team and a system that never loses track of your history.',
        columns: 3,
        items: [
          { icon: 'Stethoscope', title: 'Expert specialists', text: 'Board-certified doctors across more than ten specialties.' },
          { icon: 'CalendarCheck', title: 'Easy appointments', text: 'Request a visit online and get a confirmation the same day.' },
          { icon: 'ShieldCheck', title: 'Safe & private', text: 'Your records are protected and only seen by your care team.' },
          { icon: 'Activity', title: 'Recovery tracking', text: 'We follow up on every patient until they are fully recovered.' },
          { icon: 'Ambulance', title: 'Emergency care', text: 'Our emergency line and on-call doctors are available 24/7.' },
          { icon: 'HeartPulse', title: 'Whole-person care', text: 'From check-ups to chronic conditions, we care for the whole family.' },
        ],
      }),
      block('specialties', { eyebrow: 'Departments', title: 'Our specialties', subtitle: 'Live from our doctor directory — always up to date.' }, { background: 'muted' }),
      block('doctors', { eyebrow: 'Our team', title: 'Meet our senior specialists', subtitle: 'Experienced, caring and ready to help — every one of them tracks their patients’ recovery.', layout: 'portrait', count: 4, specialization: '', buttonLabel: 'See all doctors', buttonUrl: '/doctors' }),
      block('steps', {
        eyebrow: 'How it works',
        title: 'From booking to recovery in three steps',
        items: [
          { title: 'Request a visit', text: 'Choose a doctor or tell us your symptoms using our online form.' },
          { title: 'See your specialist', text: 'Meet your doctor in person — we confirm your time by email.' },
          { title: 'We track your recovery', text: 'Your doctor follows your condition and progress after every visit.' },
        ],
      }, { background: 'muted' }),
      block('testimonials', {
        eyebrow: 'Patient stories',
        title: 'What our patients say',
        items: [
          { name: 'Sarah M.', role: 'Cardiology patient', quote: 'The team followed up after every visit. I never felt like just a number.', rating: 5 },
          { name: 'James R.', role: 'Parent', quote: 'Booking for my son took two minutes and the pediatrician was wonderful.', rating: 5 },
          { name: 'Amina K.', role: 'Orthopedics patient', quote: 'Clear explanations, short waits and a recovery plan that actually worked.', rating: 5 },
        ],
      }),
      block('cta', { title: 'Need to see a doctor?', text: 'Request an appointment today — most visits are confirmed within hours.', primaryLabel: 'Book now', primaryUrl: '/contact', secondaryLabel: 'Call us', secondaryUrl: 'tel:+15550102030' }),
    ],
  },
  {
    title: 'About us',
    slug: 'about',
    seoDescription: 'Learn about our clinic, our mission and the people behind it.',
    blocks: [
      block('pageHeader', { eyebrow: 'About us', title: 'Medicine with a memory', subtitle: 'We started Doctor Tracker so that no patient’s story gets lost between visits.' }),
      block('imageText', {
        eyebrow: 'Our mission',
        title: 'Every patient followed, every step of the way',
        text: 'Our doctors work as one team. Each patient has a single record that every specialist can see, so care is joined-up and nothing is missed.',
        image: '/images/site/care-team.jpg',
        imagePosition: 'right',
        bullets: ['Shared records across departments', 'Follow-up after every visit', 'Clear, honest communication'],
        buttonLabel: 'Meet the doctors',
        buttonUrl: '/doctors',
      }),
      block('stats', { source: 'manual', title: 'Our clinic in numbers', items: [{ value: '15+', label: 'Years of care' }, { value: '98%', label: 'Patient satisfaction' }, { value: '24/7', label: 'Emergency support' }, { value: '6', label: 'Partner hospitals' }] }, { background: 'muted' }),
      block('richText', { html: '<h2>Our values</h2><p>We believe great healthcare is <strong>personal, transparent and continuous</strong>. That means listening first, explaining clearly and staying with our patients until they are well.</p><ul><li>Patients first, always</li><li>Evidence-based medicine</li><li>Respect for every person</li></ul>' }),
      block('gallery', {
        title: 'Inside our clinic',
        columns: 3,
        images: [
          { src: '/images/site/reception.jpg', caption: 'Welcoming reception' },
          { src: '/images/site/consultation.jpg', caption: 'Private patient rooms' },
          { src: '/images/site/operating-room.jpg', caption: 'Modern operating theatres' },
          { src: '/images/site/checkup.jpg', caption: 'Routine check-ups' },
          { src: '/images/site/patient-ward.jpg', caption: 'Calm recovery wards' },
          { src: '/images/site/hospital-building.jpg', caption: 'City General campus' },
        ],
      }),
      block('cta', { title: 'Join thousands of happy patients', text: 'Book your first visit today.', primaryLabel: 'Book an appointment', primaryUrl: '/contact', secondaryLabel: '', secondaryUrl: '' }),
    ],
  },
  {
    title: 'Our doctors',
    slug: 'doctors',
    seoDescription: 'Browse our specialist doctors by department.',
    blocks: [
      block('pageHeader', { eyebrow: 'Our team', title: 'Find the right doctor', subtitle: 'Specialists across every major department, ready to help.' }),
      block('doctors', { eyebrow: '', title: '', subtitle: '', layout: 'compact', showFilters: true, count: 24, specialization: '', buttonLabel: '', buttonUrl: '' }),
      block('specialties', { eyebrow: 'Departments', title: 'Browse by specialty', subtitle: '' }, { background: 'muted' }),
    ],
  },
  {
    title: 'Services',
    slug: 'services',
    seoDescription: 'The medical services and departments available at our clinic.',
    blocks: [
      block('pageHeader', { eyebrow: 'Services', title: 'Complete care under one roof', subtitle: 'From routine check-ups to specialist treatment.' }),
      block('features', {
        eyebrow: '',
        title: 'What we offer',
        subtitle: '',
        columns: 3,
        items: [
          { icon: 'HeartPulse', title: 'Cardiology', text: 'Heart check-ups, ECG and long-term heart care.' },
          { icon: 'Brain', title: 'Neurology', text: 'Diagnosis and treatment of the brain and nervous system.' },
          { icon: 'Baby', title: 'Pediatrics', text: 'Gentle care for babies, children and teenagers.' },
          { icon: 'Bone', title: 'Orthopedics', text: 'Bones, joints, sports injuries and rehabilitation.' },
          { icon: 'Eye', title: 'Ophthalmology', text: 'Eye exams, vision care and eye surgery.' },
          { icon: 'Microscope', title: 'Diagnostics', text: 'On-site lab tests and imaging with fast results.' },
        ],
      }),
      block('imageText', {
        eyebrow: 'Diagnostics',
        title: 'Fast, accurate results on site',
        text: 'X-ray, ultrasound, MRI and a full lab under one roof — most results reach your doctor the same day.',
        image: '/images/site/diagnostics.jpg',
        imagePosition: 'left',
        bullets: ['Digital imaging with instant sharing', 'Same-day blood test results', 'Specialists review every scan'],
        buttonLabel: 'Book a test',
        buttonUrl: '/contact',
      }, { background: 'muted' }),
      block('faq', {
        eyebrow: 'FAQ',
        title: 'Frequently asked questions',
        items: [
          { question: 'Do I need a referral?', answer: 'No — you can book most specialists directly. Some insurance plans may ask for one.' },
          { question: 'How fast can I get an appointment?', answer: 'Most requests are confirmed the same day, and urgent cases are seen within 24 hours.' },
          { question: 'Can I see my medical history?', answer: 'Yes. Ask your doctor or our front desk and we will share your records securely.' },
          { question: 'Do you accept insurance?', answer: 'We work with most major insurers. Contact us to check your plan.' },
        ],
      }),
    ],
  },
  {
    title: 'Contact',
    slug: 'contact',
    seoDescription: 'Book an appointment or send us a message.',
    blocks: [
      block('pageHeader', { eyebrow: 'Contact', title: 'Book a visit or ask a question', subtitle: 'We usually reply within a few hours.' }),
      block('contactForm', { mode: 'appointment', title: 'Request an appointment', text: 'Tell us how we can help and choose a doctor if you have one in mind.', showInfo: true }),
    ],
  },
  {
    title: 'Privacy policy',
    slug: 'privacy-policy',
    seoDescription: 'How we handle your personal and medical information.',
    blocks: [
      block('pageHeader', { eyebrow: 'Legal', title: 'Privacy policy', subtitle: '' }),
      block('richText', { html: '<p>Your privacy matters to us. We only collect the information needed to provide care and respond to your requests, and we never sell personal data.</p><h3>What we collect</h3><p>Contact details you send us through our forms, and medical information recorded by your care team.</p><h3>Your rights</h3><p>You can ask to see, correct or delete your information at any time by contacting us.</p>' }),
    ],
  },
];

const MENUS = [
  {
    location: 'header',
    name: 'Header menu',
    items: [
      { label: 'Home', url: '/', newTab: false, children: [] },
      { label: 'About', url: '/about', newTab: false, children: [] },
      { label: 'Doctors', url: '/doctors', newTab: false, children: [] },
      { label: 'Services', url: '/services', newTab: false, children: [] },
      { label: 'Contact', url: '/contact', newTab: false, children: [] },
    ],
  },
  {
    location: 'footer',
    name: 'Footer menu',
    items: [
      { label: 'About us', url: '/about', newTab: false, children: [] },
      { label: 'Our doctors', url: '/doctors', newTab: false, children: [] },
      { label: 'Services', url: '/services', newTab: false, children: [] },
      { label: 'Privacy policy', url: '/privacy-policy', newTab: false, children: [] },
      { label: 'Staff login', url: '/admin', newTab: false, children: [] },
    ],
  },
];

// Alternative home page designs. Pick one in Admin → Site settings → General → Home page,
// or open them directly (/home-bold, /home-minimal, /home-bento).
const HOSPITAL_NAMES = ['City General Hospital', 'St. Mary Medical Center', 'Green Valley Clinic', 'Riverside Hospital', 'Sunrise Health Institute', 'Northside Children’s Hospital'];
const QUOTES = [
  { name: 'Sarah M.', role: 'Cardiology patient', quote: 'The team followed up after every visit. I never felt like just a number.', rating: 5 },
  { name: 'James R.', role: 'Parent', quote: 'Booking for my son took two minutes and the pediatrician was wonderful.', rating: 5 },
  { name: 'Amina K.', role: 'Orthopedics patient', quote: 'Clear explanations, short waits and a recovery plan that actually worked.', rating: 5 },
];

const DEMO_PAGES = [
  {
    title: 'Home — Bold (demo)',
    slug: 'home-bold',
    seoTitle: 'Doctor Tracker — Specialist care, around the clock',
    seoDescription: 'A bold, dark home page design.',
    blocks: [
      block('hero', {
        variant: 'fullscreen',
        eyebrow: 'Open 24/7 · Emergency ready',
        title: 'Expert care when every minute matters',
        subtitle: 'Forty specialists, six partner hospitals and one record that follows you from the first visit to full recovery.',
        primaryLabel: 'Book an appointment',
        primaryUrl: '/contact',
        secondaryLabel: 'Call emergency',
        secondaryUrl: 'tel:+15559110000',
        image: '/images/site/surgeons.jpg',
        badges: ['Board-certified surgeons', 'Same-day results'],
      }),
      block('marquee', { title: 'Our partner hospitals', items: HOSPITAL_NAMES }),
      block('features', {
        variant: 'list',
        eyebrow: 'Why patients choose us',
        title: 'Medicine that never loses track',
        subtitle: 'Every department shares one record, so your care is joined-up from day one.',
        items: [
          { icon: 'Stethoscope', title: 'Specialists, not generalists', text: 'Twelve departments led by board-certified doctors.' },
          { icon: 'Scan', title: 'Diagnostics on site', text: 'Imaging and lab results reach your doctor the same day.' },
          { icon: 'Activity', title: 'Recovery tracking', text: 'Your condition is followed after every visit until you are well.' },
          { icon: 'Ambulance', title: '24/7 emergency line', text: 'On-call doctors and an emergency team, day and night.' },
        ],
      }, { background: 'dark' }),
      block('doctors', { eyebrow: 'Senior team', title: 'The people behind your care', subtitle: '', layout: 'portrait', count: 4, specialization: '', buttonLabel: 'Meet every doctor', buttonUrl: '/doctors' }),
      block('stats', { source: 'live', title: '', items: [] }, { background: 'dark', spacing: 'compact' }),
      block('testimonials', { eyebrow: 'Patient stories', title: '', variant: 'carousel', items: QUOTES }),
      block('cta', { title: 'Don’t wait to feel better', text: 'Most appointments are confirmed within hours.', primaryLabel: 'Book now', primaryUrl: '/contact', secondaryLabel: 'See services', secondaryUrl: '/services' }),
    ],
  },
  {
    title: 'Home — Minimal (demo)',
    slug: 'home-minimal',
    seoTitle: 'Doctor Tracker — Calm, simple healthcare',
    seoDescription: 'A calm, minimal home page design.',
    blocks: [
      block('hero', {
        variant: 'centered',
        eyebrow: 'Healthcare, simplified',
        title: 'The calm way to see a specialist',
        subtitle: 'Choose a doctor, pick a time, and let us keep track of the rest.',
        primaryLabel: 'Find a doctor',
        primaryUrl: '/doctors',
        secondaryLabel: 'How it works',
        secondaryUrl: '/services',
        image: '/images/site/consultation.jpg',
        badges: [],
      }, { background: 'default' }),
      block('stats', { source: 'live', title: '', items: [] }, { spacing: 'compact' }),
      block('steps', {
        eyebrow: 'Three steps',
        title: 'From booking to recovery',
        items: [
          { title: 'Tell us what’s wrong', text: 'Send a short request online — it takes two minutes.' },
          { title: 'Meet your specialist', text: 'We match you with the right doctor and confirm by email.' },
          { title: 'We follow up', text: 'Your doctor checks on your progress after every visit.' },
        ],
      }),
      block('imageText', {
        eyebrow: 'One record',
        title: 'Every doctor sees the full picture',
        text: 'Your history, scans and notes live in one place, so you never have to repeat yourself.',
        image: '/images/site/care-team.jpg',
        imagePosition: 'left',
        bullets: ['Shared across departments', 'Private and secure', 'Updated after every visit'],
        buttonLabel: '',
        buttonUrl: '',
      }, { background: 'muted' }),
      block('specialties', { eyebrow: 'Departments', title: 'Twelve specialties, one team', subtitle: '' }),
      block('faq', {
        eyebrow: 'Questions',
        title: 'Good to know',
        items: [
          { question: 'Do I need a referral?', answer: 'No — you can book most specialists directly.' },
          { question: 'How fast can I be seen?', answer: 'Most requests are confirmed the same day.' },
          { question: 'Can I see my records?', answer: 'Yes. Ask your doctor or the front desk at any time.' },
        ],
      }, { background: 'muted' }),
      block('cta', { title: 'Ready when you are', text: 'Book your first visit today.', primaryLabel: 'Book an appointment', primaryUrl: '/contact', secondaryLabel: '', secondaryUrl: '' }),
    ],
  },
  {
    title: 'Home — Bento (demo)',
    slug: 'home-bento',
    seoTitle: 'Doctor Tracker — Your clinic at a glance',
    seoDescription: 'A modern bento-grid home page design.',
    blocks: [
      block('hero', {
        variant: 'bento',
        eyebrow: 'Your clinic at a glance',
        title: 'Healthcare that adds up',
        subtitle: 'Real doctors, live numbers and a care team that remembers you.',
        primaryLabel: 'Book a visit',
        primaryUrl: '/contact',
        secondaryLabel: 'Our doctors',
        secondaryUrl: '/doctors',
        image: '/images/site/checkup.jpg',
        badges: ['Same-day visits'],
      }),
      block('marquee', { title: '', items: ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology', 'ENT', 'Ophthalmology'] }, { background: 'muted' }),
      block('features', {
        variant: 'cards',
        eyebrow: 'What you get',
        title: 'Everything in one place',
        subtitle: '',
        columns: 4,
        items: [
          { icon: 'CalendarCheck', title: 'Online booking', text: 'Request a visit any time.' },
          { icon: 'ShieldCheck', title: 'Private records', text: 'Only your care team sees them.' },
          { icon: 'Microscope', title: 'On-site lab', text: 'Results the same day.' },
          { icon: 'HeartPulse', title: 'Follow-up', text: 'We check in after every visit.' },
        ],
      }),
      block('doctors', { eyebrow: 'Find your doctor', title: 'Browse by specialty', subtitle: '', layout: 'compact', showFilters: true, count: 12, specialization: '', buttonLabel: 'All doctors', buttonUrl: '/doctors' }, { background: 'muted' }),
      block('gallery', {
        title: 'Inside our clinic',
        columns: 3,
        images: [
          { src: '/images/site/reception.jpg', caption: 'Reception' },
          { src: '/images/site/operating-room.jpg', caption: 'Operating theatre' },
          { src: '/images/site/patient-ward.jpg', caption: 'Recovery ward' },
        ],
      }),
      block('testimonials', { eyebrow: 'Reviews', title: 'Patients say it best', variant: 'grid', items: QUOTES }, { background: 'muted' }),
      block('cta', { title: 'See a specialist this week', text: 'Most requests are confirmed within hours.', primaryLabel: 'Book now', primaryUrl: '/contact', secondaryLabel: '', secondaryUrl: '' }),
    ],
  },
];

const published = (pages) => pages.map((p) => ({ ...p, status: 'published' }));

module.exports = { PAGES: published(PAGES), DEMO_PAGES: published(DEMO_PAGES), MENUS };
