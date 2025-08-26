// naukri-update.js — click the exact <span class="edit icon"> for Resume headline
require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer-extra');
const Stealth = require('puppeteer-extra-plugin-stealth');
puppeteer.use(Stealth());

// CONFIG
const HEADLESS = (process.env.HEADLESS ?? 'false') === 'true'; // visible by default for debugging
const PROFILE_URL = 'https://www.naukri.com/mnjuser/profile';
const FORCE_HEADLINE = (process.env.FORCE_HEADLINE ?? '').trim(); // leave empty to only append '.'
const EMAIL = process.env.NAUKRI_EMAIL || '';
const PASSWORD = process.env.NAUKRI_PASSWORD || '';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Click helper that survives overlays/renders
async function robustClick(page, handle) {
  if (!handle) return false;
  try { await handle.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' })); } catch {}
  // 1) DOM click
  try { await handle.click({ delay: 40 }); return true; } catch {}
  // 2) Real mouse click
  try {
    const box = await handle.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
      await page.mouse.down(); await page.mouse.up();
      return true;
    }
  } catch {}
  // 3) Focus + Enter
  try { await handle.focus(); await page.keyboard.press('Enter'); return true; } catch {}
  return false;
}

// Try to get the clickable handle for the specific pencil
async function getResumePencilHandle(page) {
  // Return the <span class="edit icon"> that shares the widgetHead with "Resume headline"
  const h = await page.evaluateHandle(() => {
    const heads = Array.from(document.querySelectorAll('.widgetHead'));
    for (const head of heads) {
      const title = head.querySelector('.widgetTitle');
      if (title && /resume\s*headline/i.test(title.textContent || '')) {
        const pencil = head.querySelector('span.edit.icon');
        if (pencil) return pencil;
      }
    }
    return null;
  });
  const el = h.asElement?.();
  return el || null;
}

(async () => {
  if (!EMAIL || !PASSWORD) {
    console.error('❌ Missing NAUKRI_EMAIL or NAUKRI_PASSWORD in .env');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: { width: 1366, height: 900 },
    slowMo: HEADLESS ? 0 : 40,
    args: ['--no-sandbox','--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  try {
    // --- login with email/password from .env ---
    console.log('➡️  Opening login…');
    await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'networkidle2', timeout: 60000 });

    // Selectors from actual DOM
    const emailSel = '#usernameField';
    const passSel  = '#passwordField';
    const submitSel = '#loginForm button[type="submit"]';

    // Wait for email field
    await page.waitForSelector(emailSel, { timeout: 20000 });
    await page.type(emailSel, EMAIL, { delay: 40 });
    await page.type(passSel, PASSWORD, { delay: 40 });

    // Click login
    await page.click(submitSel);

    // Wait for navigation/profile redirect
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
    await sleep(600);

    console.log('➡️  Opening profile…');
    await page.goto(PROFILE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(800);

    // Wait until the "Resume headline" title is present
    await page.waitForFunction(() => /resume\s*headline/i.test(document.body.innerText || ''), { timeout: 15000 });

    // Find and click the exact pencil
    console.log('🖉 Locating the Resume headline pencil…');
    let pencil = await getResumePencilHandle(page);
    if (!pencil) {
      // small settle + re-try once in case of hydration lag
      await sleep(600);
      pencil = await getResumePencilHandle(page);
    }
    if (!pencil) throw new Error('resume-pencil-not-found (span.edit.icon)');

    console.log('🔘 Clicking pencil…');
    const clicked = await robustClick(page, pencil);
    if (!clicked) throw new Error('resume-pencil-not-clickable');

    // Wait for editor textarea
    await page.waitForSelector('#resumeHeadlineTxt', { timeout: 15000 });
    await page.$eval('#resumeHeadlineTxt', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));

    // Read current text
    let current = await page.$eval('#resumeHeadlineTxt', el => (el.value || '').trim());
    console.log('📄 Current:', current);

    // Compute new value
    const newValue = FORCE_HEADLINE ? FORCE_HEADLINE : (current.endsWith('.') ? current : current + '.');
    if (newValue === current) {
      console.log('ℹ️ No change needed.');
      return;
    }

    console.log('✏️  Updating to:', newValue);

    // React-safe set
    await page.$eval('#resumeHeadlineTxt', (el, val) => {
      el.focus();
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, newValue);

    await sleep(400);

    // Save
    const saved = await page.evaluate(() => {
      const btn = document.querySelector('form[name="resumeHeadlineForm"] button[type="submit"]')
        || Array.from(document.querySelectorAll('button')).find(b => /save/i.test(b.textContent || '') && !b.disabled);
      if (!btn) return false;
      btn.scrollIntoView({ behavior: 'instant', block: 'center' });
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return true;
    });
    if (!saved) throw new Error('save-button-not-found');

    await sleep(1200);
    console.log('✅ Resume Headline saved.');

  } catch (e) {
    console.error('❌', e.message);
    try { await page.screenshot({ path: `debug_error_${Date.now()}.png`, fullPage: true }); } catch {}
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
