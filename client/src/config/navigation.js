import { LayoutDashboard, Stethoscope, UserRound, Users } from 'lucide-react';

// Admin sidebar sections. Each link is shown only to users with its permission (`perm`).
export const ADMIN_NAV = [
  { title: 'Clinic', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard', exact: true },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope, perm: 'doctors' },
    { href: '/admin/patients', label: 'Patients', icon: Users, perm: 'patients' },
  ] },
  { title: 'Account', items: [
    { href: '/admin/profile', label: 'My profile', icon: UserRound },
  ] },
];
