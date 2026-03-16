export const API_CONFIG = [
  // Auth endpoints
  { key: 'LOGIN', method: 'POST', url: '/auth/login', auth: false },
  { key: 'REFRESH', method: 'POST', url: '/auth/refresh-token', auth: false },
  { key: 'PROFILE', method: 'GET', url: '/user/profile', auth: true },

  // Campaign endpoints
  { key: 'GET_CAMPAIGNS', method: 'GET', url: '/campaigns', auth: true },
  { key: 'CREATE_CAMPAIGN', method: 'POST', url: '/campaigns', auth: true },
  { key: 'UPDATE_CAMPAIGN', method: 'PUT', url: '/campaigns/:id', auth: true },
  { key: 'DELETE_CAMPAIGN', method: 'DELETE', url: '/campaigns/:id', auth: true },
  { key: 'TOGGLE_CAMPAIGN', method: 'PUT', url: '/campaigns/:id/toggle', auth: true },
  { key: 'UPLOAD_CLIENTS', method: 'POST', url: '/campaigns/:id/upload-clients', auth: true },

  // Template endpoints
  { key: 'GET_TEMPLATES', method: 'GET', url: '/templates', auth: true },
  { key: 'CREATE_TEMPLATE', method: 'POST', url: '/templates', auth: true },
  { key: 'UPDATE_TEMPLATE', method: 'PUT', url: '/templates/:id', auth: true },
  { key: 'DELETE_TEMPLATE', method: 'DELETE', url: '/templates/:id', auth: true },

  // Email Config endpoints
  { key: 'GET_EMAIL_CONFIGS', method: 'GET', url: '/email-configs', auth: true },
  { key: 'CREATE_EMAIL_CONFIG', method: 'POST', url: '/email-configs', auth: true },
  { key: 'UPDATE_EMAIL_CONFIG', method: 'PUT', url: '/email-configs/:id', auth: true },
  { key: 'DELETE_EMAIL_CONFIG', method: 'DELETE', url: '/email-configs/:id', auth: true },

  // User endpoints
  { key: 'GET_USERS', method: 'GET', url: '/users', auth: true },
  { key: 'CREATE_USER', method: 'POST', url: '/users', auth: true },
  { key: 'UPDATE_USER', method: 'PUT', url: '/users/:id', auth: true },
  { key: 'DELETE_USER', method: 'DELETE', url: '/users/:id', auth: true },
];
