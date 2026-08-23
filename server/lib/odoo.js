const axios = require('axios');

const { ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_API_KEY } = process.env;

// ── Session cache — reuse cookie for 8 minutes before re-authenticating
let sessionCache = { cookie: null, expiresAt: 0 };

async function getOdooSession() {
  if (sessionCache.cookie && Date.now() < sessionCache.expiresAt) {
    return sessionCache.cookie;
  }

  const response = await axios.post(`${ODOO_URL}/web/session/authenticate`, {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      db: ODOO_DB,
      login: ODOO_USERNAME,
      password: ODOO_API_KEY
    }
  }, {
    headers: { 'Content-Type': 'application/json' }
  });

  if (!response.data.result || !response.data.result.uid) {
    throw new Error('Odoo authentication failed — check your email, API key and DB name');
  }

  sessionCache.cookie = response.headers['set-cookie']?.[0];
  sessionCache.expiresAt = Date.now() + 8 * 60 * 1000; // 8 minutes
  return sessionCache.cookie;
}

// Make an authenticated Odoo API call
async function odooCall(model, method, args = [], kwargs = {}) {
  const cookie = await getOdooSession();

  const response = await axios.post(`${ODOO_URL}/web/dataset/call_kw`, {
    jsonrpc: '2.0',
    method: 'call',
    params: { model, method, args, kwargs }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie
    }
  });

  if (response.data.error) throw new Error(response.data.error.data.message);
  return response.data.result;
}

module.exports = { odooCall };
