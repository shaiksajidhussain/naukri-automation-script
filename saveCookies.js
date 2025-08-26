// saveCookies.js (fixed for modern Puppeteer)
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(Stealth());

const HEADLESS = (process.env.HEADLESS ?? 'false') === 'true';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: { width: 1366, height: 850 },
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'networkidle2' });
  console.log('⚠️  In the opened browser, click "Continue with Google" and complete login.');

  // Wait for you to confirm from the terminal (more reliable than arbitrary timeouts)
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await new Promise(res => rl.question('👉 Press ENTER here **after** Google login finishes… ', () => { rl.close(); res(); }));

  // Try the profile page to ensure we’re authenticated
  await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'networkidle2', timeout: 60000 });
  await sleep(1500);

  const cookies = await page.cookies();
  fs.writeFileSync('naukri.cookies.json', JSON.stringify(cookies, null, 2));
  console.log('✅ Cookies saved to naukri.cookies.json');

  await browser.close();
})().catch(async (e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
