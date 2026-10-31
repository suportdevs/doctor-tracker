import {
  Activity, Ambulance, Award, Baby, BadgeCheck, Bone, Brain, Building2, CalendarCheck, Clock, Droplets, Ear, Eye,
  FlaskConical, HandHeart, Heart, HeartPulse, Hospital, Leaf, Microscope, Phone, Pill, ShieldCheck, Smile, Sparkles,
  Star, Stethoscope, Syringe, Thermometer, Users, Zap, Accessibility, Apple, Bandage, Dna, Scan, Tablets,
} from 'lucide-react';

// Curated icon set for website blocks (importing only these keeps the bundle small).
export const ICONS = {
  Activity, Ambulance, Award, Baby, BadgeCheck, Bone, Brain, Building2, CalendarCheck, Clock, Droplets, Ear, Eye,
  FlaskConical, HandHeart, Heart, HeartPulse, Hospital, Leaf, Microscope, Phone, Pill, ShieldCheck, Smile, Sparkles,
  Star, Stethoscope, Syringe, Thermometer, Users, Zap, Accessibility, Apple, Bandage, Dna, Scan, Tablets,
};

export const ICON_NAMES = Object.keys(ICONS);

// Best-guess icon for a medical specialty name (used by the "Specialties" block).
const SPECIALTY_ICONS = {
  cardio: HeartPulse, neuro: Brain, pediatr: Baby, ortho: Bone, derma: Sparkles, onco: Dna, general: Stethoscope,
  gyne: HandHeart, psych: Smile, ent: Ear, ophthal: Eye, endo: FlaskConical,
};
export function specialtyIcon(name = '') {
  const key = Object.keys(SPECIALTY_ICONS).find((k) => name.toLowerCase().startsWith(k));
  return key ? SPECIALTY_ICONS[key] : Stethoscope;
}
