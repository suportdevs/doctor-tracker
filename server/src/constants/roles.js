// Roles and what each one can do. Defined in code (no database migration needed):
// to add a permission, add its key to PERMISSIONS and to the roles that should have it.
const PERMISSIONS = {
  dashboard: 'View dashboard & analytics',
  doctors: 'Manage doctors',
  patients: 'Manage patients',
};

const ROLES = {
  admin: { label: 'Administrator', permissions: ['*'] },
};

module.exports = { PERMISSIONS, ROLES };
