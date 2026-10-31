const { ROLES } = require('../constants/roles');

const permissionsFor = (role) => ROLES[role]?.permissions || [];

const hasPermission = (user, key) => {
  const perms = permissionsFor(user?.role);
  return perms.includes('*') || perms.includes(key);
};

module.exports = { permissionsFor, hasPermission };
