// Roles and what each one can do. Defined in code (no database migration needed):
// to add a permission, add its key to PERMISSIONS and to the roles that should have it.
const PERMISSIONS = {
  dashboard: 'View dashboard & analytics',
  doctors: 'Manage doctors',
  patients: 'Manage patients',
  website: 'Manage website pages, menus, media & settings',
  messages: 'Read website messages & appointment requests',
  users: 'Manage admin users',
};

const ROLES = {
  admin: { label: 'Administrator', permissions: ['*'] },
  manager: { label: 'Clinic manager', permissions: ['dashboard', 'doctors', 'patients', 'messages'] },
  editor: { label: 'Website editor', permissions: ['dashboard', 'website', 'messages'] },
};

module.exports = { PERMISSIONS, ROLES };
