module.exports = {
  // API oficial del BOE — acceso libre, sin API key
  baseUrl: 'https://www.boe.es/datosabiertos/api',
  timeout: parseInt(process.env.BOE_API_TIMEOUT) || 8000,
  retryAttempts: 3,
  retryDelay: 1000
};
