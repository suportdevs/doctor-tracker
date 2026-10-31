import { ICON_NAMES } from '@/lib/icons';

/*
 * Website block registry — the single place that defines what an admin can put on a page.
 * Each block has: label, description, category, icon (lucide name), default data and a field list.
 * The page builder renders its form from `fields`; components/site/blocks renders the website output.
 *
 * Field types: text | textarea | richtext | image | url | select | number | toggle | stringList | list | icon
 * To add a block: add it here, add its component in components/site/blocks and register it in BlockRenderer.
 */

const heading = [
  { name: 'eyebrow', label: 'Small label above title', type: 'text', half: true },
  { name: 'title', label: 'Title', type: 'text', half: true },
];
const button = (prefix, label) => [
  { name: `${prefix}Label`, label: `${label} text`, type: 'text', half: true },
  { name: `${prefix}Url`, label: `${label} link`, type: 'url', half: true },
];

export const BLOCKS = {
  hero: {
    label: 'Hero', category: 'Headers', icon: 'Sparkles', description: 'Big headline with buttons and image',
    defaults: { variant: 'split', eyebrow: 'Welcome', title: 'Your health, in good hands', subtitle: 'Explain what you offer in one or two sentences.', primaryLabel: 'Book appointment', primaryUrl: '/contact', secondaryLabel: 'Our doctors', secondaryUrl: '/doctors', image: '', badges: ['Same-day visits'] },
    fields: [
      { name: 'variant', label: 'Layout', type: 'select', options: [['split', 'Text + image'], ['centered', 'Centered (image below)'], ['fullscreen', 'Full-screen image'], ['bento', 'Bento grid (live doctors & numbers)']] },
      ...heading,
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      ...button('primary', 'Main button'),
      ...button('secondary', 'Second button'),
      { name: 'image', label: 'Image', type: 'image', hint: 'Text + image: leave empty to show an illustration. Full-screen: the background photo.' },
      { name: 'badges', label: 'Highlights', type: 'stringList' },
    ],
  },
  pageHeader: {
    label: 'Page header', category: 'Headers', icon: 'PanelTop', description: 'Title banner for inner pages',
    defaults: { eyebrow: '', title: 'Page title', subtitle: 'A short description of this page.' },
    fields: [...heading, { name: 'subtitle', label: 'Subtitle', type: 'textarea' }],
  },
  features: {
    label: 'Features', category: 'Content', icon: 'LayoutGrid', description: 'Icon cards in a grid',
    defaults: { eyebrow: 'Why us', title: 'Care designed around you', subtitle: '', columns: 3, items: [{ icon: 'Stethoscope', title: 'Expert doctors', text: 'Describe this feature.' }, { icon: 'ShieldCheck', title: 'Safe & private', text: 'Describe this feature.' }, { icon: 'Clock', title: 'Fast visits', text: 'Describe this feature.' }] },
    fields: [
      ...heading,
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'variant', label: 'Style', type: 'select', options: [['cards', 'Icon cards'], ['list', 'Numbered list']] },
      { name: 'columns', label: 'Columns', type: 'select', options: [[2, '2'], [3, '3'], [4, '4']] },
      { name: 'items', label: 'Cards', type: 'list', itemLabel: 'title', defaults: { icon: 'Star', title: 'Feature', text: 'Describe it.' }, fields: [
        { name: 'icon', label: 'Icon', type: 'icon', options: ICON_NAMES },
        { name: 'title', label: 'Title', type: 'text' },
        { name: 'text', label: 'Text', type: 'textarea' },
      ] },
    ],
  },
  imageText: {
    label: 'Image + text', category: 'Content', icon: 'Columns2', description: 'Image beside text with bullet points',
    defaults: { eyebrow: '', title: 'Tell your story', text: 'Pair an image with supporting text.', image: '', imagePosition: 'right', bullets: ['First point', 'Second point'], buttonLabel: '', buttonUrl: '' },
    fields: [
      ...heading,
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'imagePosition', label: 'Image position', type: 'select', options: [['left', 'Left'], ['right', 'Right']] },
      { name: 'bullets', label: 'Bullet points', type: 'stringList' },
      ...button('button', 'Button'),
    ],
  },
  richText: {
    label: 'Text', category: 'Content', icon: 'Type', description: 'Formatted text (HTML)',
    defaults: { html: '<h2>Heading</h2><p>Write your content here…</p>' },
    fields: [{ name: 'html', label: 'Content', type: 'richtext', hint: 'Basic HTML: <h2>, <p>, <strong>, <ul><li>, <a href>. Scripts are removed on save.' }],
  },
  stats: {
    label: 'Numbers', category: 'Content', icon: 'BarChart3', description: 'Big numbers — live from the database or typed in',
    defaults: { source: 'live', title: '', items: [{ value: '15+', label: 'Years of care' }] },
    fields: [
      { name: 'source', label: 'Numbers', type: 'select', options: [['live', 'Live: doctors, patients, specialties, hospitals'], ['manual', 'Typed in below']] },
      { name: 'title', label: 'Title (optional)', type: 'text' },
      { name: 'items', label: 'Numbers', type: 'list', itemLabel: 'label', showIf: (d) => d.source === 'manual', defaults: { value: '100', label: 'Label' }, fields: [
        { name: 'value', label: 'Value', type: 'text', half: true },
        { name: 'label', label: 'Label', type: 'text', half: true },
      ] },
    ],
  },
  steps: {
    label: 'Steps', category: 'Content', icon: 'ListOrdered', description: 'Numbered “how it works” steps',
    defaults: { eyebrow: 'How it works', title: 'Three simple steps', items: [{ title: 'Book', text: 'Request a visit online.' }, { title: 'Visit', text: 'Meet your doctor.' }, { title: 'Recover', text: 'We follow up with you.' }] },
    fields: [...heading, { name: 'items', label: 'Steps', type: 'list', itemLabel: 'title', defaults: { title: 'Step', text: '' }, fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'text', label: 'Text', type: 'textarea' },
    ] }],
  },
  doctors: {
    label: 'Doctors', category: 'Live data', icon: 'Stethoscope', description: 'Doctor cards from your doctor list',
    defaults: { eyebrow: 'Our team', title: 'Meet our doctors', subtitle: '', layout: 'compact', count: 8, specialization: '', buttonLabel: '', buttonUrl: '' },
    fields: [
      ...heading,
      { name: 'subtitle', label: 'Subtitle', type: 'textarea' },
      { name: 'layout', label: 'Card style', type: 'select', options: [['compact', 'Compact (round photo)'], ['portrait', 'Large photo']] },
      { name: 'showFilters', label: 'Show specialty filter buttons', type: 'toggle' },
      { name: 'count', label: 'How many doctors', type: 'number', half: true },
      { name: 'specialization', label: 'Only this specialty', type: 'text', half: true, hint: 'e.g. Cardiology — empty shows all' },
      ...button('button', 'Button'),
    ],
  },
  specialties: {
    label: 'Specialties', category: 'Live data', icon: 'HeartPulse', description: 'Departments with live doctor counts',
    defaults: { eyebrow: 'Departments', title: 'Our specialties', subtitle: '' },
    fields: [...heading, { name: 'subtitle', label: 'Subtitle', type: 'textarea' }],
  },
  testimonials: {
    label: 'Testimonials', category: 'Social proof', icon: 'Quote', description: 'Patient quotes',
    defaults: { eyebrow: 'Patient stories', title: 'What our patients say', variant: 'grid', items: [{ name: 'Patient name', role: 'Patient', quote: 'A short, honest quote.', rating: 5 }] },
    fields: [...heading, { name: 'variant', label: 'Style', type: 'select', options: [['grid', 'Cards grid'], ['carousel', 'One big quote (auto-slides)']] }, { name: 'items', label: 'Quotes', type: 'list', itemLabel: 'name', defaults: { name: 'Name', role: 'Patient', quote: '', rating: 5 }, fields: [
      { name: 'name', label: 'Name', type: 'text', half: true },
      { name: 'role', label: 'Role', type: 'text', half: true },
      { name: 'quote', label: 'Quote', type: 'textarea' },
      { name: 'rating', label: 'Stars', type: 'select', options: [[5, '5'], [4, '4'], [3, '3']], half: true },
    ] }],
  },
  faq: {
    label: 'FAQ', category: 'Social proof', icon: 'HelpCircle', description: 'Questions and answers',
    defaults: { eyebrow: 'FAQ', title: 'Frequently asked questions', items: [{ question: 'A common question?', answer: 'A clear answer.' }] },
    fields: [...heading, { name: 'items', label: 'Questions', type: 'list', itemLabel: 'question', defaults: { question: 'Question?', answer: '' }, fields: [
      { name: 'question', label: 'Question', type: 'text' },
      { name: 'answer', label: 'Answer', type: 'textarea' },
    ] }],
  },
  gallery: {
    label: 'Gallery', category: 'Media', icon: 'Images', description: 'Grid of images',
    defaults: { title: 'Our clinic', columns: 3, images: [] },
    fields: [
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'columns', label: 'Columns', type: 'select', options: [[2, '2'], [3, '3'], [4, '4']] },
      { name: 'images', label: 'Images', type: 'list', itemLabel: 'caption', defaults: { src: '', caption: '' }, fields: [
        { name: 'src', label: 'Image', type: 'image' },
        { name: 'caption', label: 'Caption', type: 'text' },
      ] },
    ],
  },
  marquee: {
    label: 'Scrolling strip', category: 'Media', icon: 'MoveHorizontal', description: 'Words that scroll sideways (partners, services…)',
    defaults: { title: 'Trusted by', items: ['City General Hospital', 'St. Mary Medical Center', 'Riverside Hospital'] },
    fields: [
      { name: 'title', label: 'Small title (optional)', type: 'text' },
      { name: 'items', label: 'Items', type: 'stringList' },
    ],
  },
  cta: {
    label: 'Call to action', category: 'Conversion', icon: 'Megaphone', description: 'Bold banner with buttons',
    defaults: { title: 'Ready to see a doctor?', text: 'Book your visit today.', primaryLabel: 'Book now', primaryUrl: '/contact', secondaryLabel: '', secondaryUrl: '' },
    fields: [{ name: 'title', label: 'Title', type: 'text' }, { name: 'text', label: 'Text', type: 'textarea' }, ...button('primary', 'Main button'), ...button('secondary', 'Second button')],
  },
  contactForm: {
    label: 'Contact / appointment form', category: 'Conversion', icon: 'Send', description: 'Form that sends to Admin → Messages',
    defaults: { mode: 'contact', title: 'Get in touch', text: 'We usually reply within a few hours.', showInfo: true },
    fields: [
      { name: 'mode', label: 'Form type', type: 'select', options: [['contact', 'Contact message'], ['appointment', 'Appointment request (with doctor & date)']] },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'text', label: 'Text', type: 'textarea' },
      { name: 'showInfo', label: 'Show contact details beside the form', type: 'toggle' },
    ],
  },
};

export const BLOCK_CATEGORIES = [...new Set(Object.values(BLOCKS).map((b) => b.category))];

// Section look, editable for every block.
export const DEFAULT_STYLE = { background: 'default', spacing: 'normal', hidden: false };
export const STYLE_FIELDS = [
  { name: 'background', label: 'Background', type: 'select', options: [['default', 'White'], ['muted', 'Soft grey'], ['tint', 'Primary tint'], ['primary', 'Primary colour'], ['dark', 'Dark']] },
  { name: 'spacing', label: 'Spacing', type: 'select', options: [['compact', 'Compact'], ['normal', 'Normal'], ['large', 'Large']] },
  { name: 'hidden', label: 'Hide this section on the website', type: 'toggle' },
];
