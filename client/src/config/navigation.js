import {
  FileText, Image as ImageIcon, LayoutDashboard, Mail, Navigation, Settings, Stethoscope, UserCog, UserRound, Users,
} from 'lucide-react';

// Admin sidebar sections. Each link is shown only to users with its permission (`perm`).
// `badge: 'messages'` shows the unread-messages count next to the link.
export const ADMIN_NAV = [
  { title: 'Clinic', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, perm: 'dashboard', exact: true },
    { href: '/admin/doctors', label: 'Doctors', icon: Stethoscope, perm: 'doctors' },
    { href: '/admin/patients', label: 'Patients', icon: Users, perm: 'patients' },
    { href: '/admin/messages', label: 'Messages', icon: Mail, perm: 'messages', badge: 'messages' },
  ] },
  { title: 'Website', items: [
    { href: '/admin/website/pages', label: 'Pages', icon: FileText, perm: 'website' },
    { href: '/admin/website/menus', label: 'Menus', icon: Navigation, perm: 'website' },
    { href: '/admin/website/media', label: 'Media', icon: ImageIcon, perm: 'website' },
    { href: '/admin/website/settings', label: 'Site settings', icon: Settings, perm: 'website' },
  ] },
  { title: 'System', items: [
    { href: '/admin/users', label: 'Users', icon: UserCog, perm: 'users' },
    { href: '/admin/profile', label: 'My profile', icon: UserRound },
  ] },
];
