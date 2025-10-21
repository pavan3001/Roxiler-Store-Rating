import axios from 'axios';

const base = process.env.API_BASE || 'http://localhost:5000/api';

const login = async () => {
  const url = `${base}/auth/login`;
  const creds = { email: 'admin@roxiler.com', password: 'Admin@123' };
  const r = await axios.post(url, creds, { timeout: 5000 });
  return r.data.token;
};

const getStores = async (token) => {
  const url = `${base}/stores`;
  const r = await axios.get(url, { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 });
  return r.data;
};

(async () => {
  try {
    console.log('Logging in...');
    const token = await login();
    console.log('Token acquired. Calling /stores...');
    const stores = await getStores(token);
    console.log('Stores:', JSON.stringify(stores, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err.message || err);
    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Body:', err.response.data);
    }
    process.exit(2);
  }
})();
