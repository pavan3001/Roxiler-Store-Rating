const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log('Request failed:', request.url(), request.failure()?.errorText || 'unknown');
  });

  // Capture responses
  page.on('response', async (response) => {
    try {
      const url = response.url();
      const status = response.status();
      if (url.includes('/api/auth/login') || url.includes('/api/stores')) {
        const text = await response.text();
        console.log(`Response for ${url} [${status}]:`, text);
      } else {
        // Optionally log other API responses
      }
    } catch (err) {
      console.error('Error reading response body', err);
    }
  });

  const base = process.env.FRONTEND_URL || 'http://localhost:5174';
  const loginUrl = `${base}/login`;
  console.log('Opening', loginUrl);

  await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 60000 }).catch(e => {
    console.error('Navigation error:', e.message);
  });

  // Fill form
  await page.waitForSelector('input[type="email"]', { timeout: 15000 });
  await page.type('input[type="email"]', 'admin@roxiler.com');
  await page.type('input[type="password"]', 'Admin@123');

  // Click sign in
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => null)
  ]);

  console.log('After submit, URL:', page.url());

  // Wait a little for any toasts
  await page.waitForTimeout(2000);

  // Optionally extract localStorage token
  const token = await page.evaluate(() => localStorage.getItem('token'));
  console.log('Token in localStorage:', token ? '[present]' : '[not present]');

  await browser.close();
})();
