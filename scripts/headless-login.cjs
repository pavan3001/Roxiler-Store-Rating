const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('requestfailed', request => {
    console.log('Request failed:', request.url(), request.failure()?.errorText || 'unknown');
  });

  // Log all requests to inspect whether API calls go to /api (proxied) or directly to Render
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api')) console.log('API request:', url, request.method());
  });

  page.on('response', async (response) => {
    try {
      const url = response.url();
      const status = response.status();
      if (url.includes('/api/auth/login') || url.includes('/api/stores')) {
        const text = await response.text();
        console.log(`Response for ${url} [${status}]:`, text);
      }
    } catch (err) {
      console.error('Error reading response body', err);
    }
  });

  const base = process.env.FRONTEND_URL || 'http://localhost:5174';
  console.log('Using FRONTEND_URL:', base);
  const loginUrl = `${base}/login`;
  console.log('Opening', loginUrl);

  await page.setCacheEnabled(false);
  await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => {
    console.error('Navigation error:', e.message);
  });

  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.type('input[type="email"]', 'admin@roxiler.com');
  await page.type('input[type="password"]', 'Admin@123');

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => null)
  ]);

  console.log('After submit, URL:', page.url());

  await page.waitForTimeout(2000);

  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token in localStorage:', token ? '[present]' : '[not present]');

  await browser.close();
})();
