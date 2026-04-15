const axios = require('axios');
const xml2js = require('xml2js');
const config = require('../config/boe.config');

const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: false });

class BOEClient {
  constructor() {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      // La API oficial devuelve XML; pedimos JSON donde esté disponible
      headers: { 'Accept': 'application/json, application/xml, text/xml' }
    });

    this.client.interceptors.request.use(req => {
      console.log(`[BOE] ${req.method.toUpperCase()} ${req.baseURL}${req.url}`);
      return req;
    });

    this.client.interceptors.response.use(
      res => res,
      err => {
        console.error(`[BOE] Error ${err.response?.status || ''}: ${err.message}`);
        throw err;
      }
    );
  }

  async get(endpoint, params = {}) {
    const response = await this.client.get(endpoint, { params });
    const contentType = response.headers['content-type'] || '';

    // Si la respuesta es XML la parseamos a objeto JS
    if (contentType.includes('xml') || (typeof response.data === 'string' && response.data.trimStart().startsWith('<'))) {
      return parser.parseStringPromise(response.data);
    }

    return response.data;
  }
}

module.exports = new BOEClient();
