const { ROLES, getRolePolicy } = require('../config/roles.config');

function resolveRole(req, _res, next) {
  const roleFromQuery = req.query.role;
  const roleFromHeader = req.headers['x-user-role'];
  const role = String(roleFromQuery || roleFromHeader || ROLES.ESTANDAR).toLowerCase();
  const policy = getRolePolicy(role);

  req.userRole = role;
  req.accessPolicy = policy;
  next();
}

module.exports = {
  resolveRole
};
