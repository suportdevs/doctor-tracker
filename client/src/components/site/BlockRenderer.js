import { Hero, PageHeader } from './blocks/HeaderBlocks';
import { Cta, Features, Gallery, ImageText, Marquee, RichText, Stats, Steps } from './blocks/ContentBlocks';
import { Doctors, Specialties } from './blocks/LiveBlocks';
import { Faq, Testimonials } from './blocks/SocialBlocks';
import { ContactForm } from './blocks/ContactForm';

// block.type → component. Keys must match config/blocks.js.
const COMPONENTS = {
  hero: Hero,
  pageHeader: PageHeader,
  features: Features,
  imageText: ImageText,
  richText: RichText,
  stats: Stats,
  steps: Steps,
  doctors: Doctors,
  specialties: Specialties,
  testimonials: Testimonials,
  faq: Faq,
  gallery: Gallery,
  marquee: Marquee,
  cta: Cta,
  contactForm: ContactForm,
};

// Used by the public website AND the admin page-builder preview, so both always look the same.
export default function BlockRenderer({ blocks = [], live, settings, showHidden = false }) {
  return blocks.map((block) => {
    const Component = COMPONENTS[block.type];
    if (!Component || (block.style?.hidden && !showHidden)) return null;
    return <Component key={block.id} data={block.data || {}} style={block.style || {}} live={live} settings={settings} />;
  });
}
