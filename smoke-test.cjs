const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allLogs = [];
  page.on('console', (msg) => { allLogs.push({ type: msg.type(), text: msg.text() }); });
  page.on('pageerror', (err) => allLogs.push({ type: 'PAGEERROR', text: err.message }));
  page.on('requestfailed', (req) => allLogs.push({ type: 'REQFAIL', text: req.url() + ' ' + (req.failure()?.errorText || '') }));

  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);

  const logsByType = {};
  for (const l of allLogs) {
    if (!logsByType[l.type]) logsByType[l.type] = [];
    logsByType[l.type].push(l.text.substring(0, 300));
  }
  console.log(JSON.stringify(logsByType, null, 2));

  const bodyHtml = await page.evaluate(() => document.body.innerHTML.substring(0, 2000));
  console.log('\nBody HTML start:', bodyHtml.substring(0, 500));

  await browser.close();
})();
