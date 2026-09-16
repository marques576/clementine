const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(1000);

  console.log('Has Clementine title:', await page.locator('h1:has-text("Clementine")').count() > 0);
  console.log('Has 100% local text:', await page.locator('text=100% local conversion').count() > 0);
  console.log('Has drop zone:', await page.locator('text=Drop a file here').count() > 0);
  console.log('Has support summary:', await page.locator('text=Convert images, audio').count() > 0);
  console.log('Has agent section:', await page.locator('summary:has-text("For AI agents")').count() > 0);

  const metrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    innerHeight: window.innerHeight,
  }));
  console.log('No scroll needed:', metrics.scrollHeight <= metrics.innerHeight + 2);

  // Select an image and verify the format pills + convert button
  await page.setInputFiles('input[type=file]', {
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from('89504e470d0a1a0a', 'hex'),
  });
  await page.waitForTimeout(500);

  console.log('Has JPG button:', await page.locator('button:has-text("JPG")').count() > 0);
  console.log('Has WEBP button:', await page.locator('button:has-text("WEBP")').count() > 0);
  console.log('Has Convert button:', await page.locator('button:has-text("Convert")').count() > 0);

  console.log('\n✅ UI smoke test complete');
  console.log('Console errors:', errors.length);
  errors.slice(0, 3).forEach((e) => console.log('  ', e.substring(0, 200)));

  await browser.close();
})();
