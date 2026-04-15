const ROLES = {
  ESTANDAR: 'estandar',
  PRO: 'pro',
  CREADOR: 'creador'
};

const ROLE_POLICIES = {
  [ROLES.ESTANDAR]: {
    label: 'Version estandar',
    maxDays: 7,
    maxResults: null,
    allowKeywordSearch: true,
    allowSectorFilter: false,
    allowTipoFilter: true,
    allowMontoFilter: false,
    allowDebug: false
  },
  [ROLES.PRO]: {
    label: 'Version pro',
    maxDays: 14,
    maxResults: null,
    allowKeywordSearch: true,
    allowSectorFilter: true,
    allowTipoFilter: true,
    allowMontoFilter: true,
    allowDebug: false
  },
  [ROLES.CREADOR]: {
    label: 'Version creador',
    maxDays: 30,
    maxResults: null,
    allowKeywordSearch: true,
    allowSectorFilter: true,
    allowTipoFilter: true,
    allowMontoFilter: true,
    allowDebug: true
  }
};

function getRolePolicy(roleValue) {
  const normalized = String(roleValue || '').trim().toLowerCase();
  return ROLE_POLICIES[normalized] || ROLE_POLICIES[ROLES.ESTANDAR];
}

module.exports = {
  ROLES,
  ROLE_POLICIES,
  getRolePolicy
};
