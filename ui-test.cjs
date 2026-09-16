const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => { if (msg.type() === 'error') logs.push(msg.text()); });
  
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(8000); // Let React render
  
  // Check key text is in DOM
  const hasClementine = await page.locator('text=Clementine').count() > 0;
  console.log('Has Clementine title:', hasClementine);
  
  const hasDragDrop = await page.locator('text=Drag & drop files here').count() > 0;
  console.log('Has drag drop text:', hasDragDrop);
  
  const hasLocally = await page.locator('text=locally in your browser').count() > 0;
  console.log('Has locally text:', hasLocally);
  
  // Check category cards
  const hasImages = await page.locator('text=🖼️  Images').count() > 0;
  console.log('Has Images card:', hasImages);
  const hasAudio = await page.locator('text=🎵  Audio').count() > 0;
  console.log('Has Audio card:', hasAudio);
  const hasVideo = await page.locator('text=🎬  Video').count() > 0;
  console.log('Has Video card:', hasVideo);
  const hasDocs = await page.locator('text=📄  Documents').count() > 0;
  console.log('Has Documents card:', hasDocs);
  
  // Check format buttons exist after file select
  // Simulate file drop
  await page.setInputFiles('input[type="file"]', [{ name: 'test.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake') }]);
  await page.waitForTimeout(2000);
  
  const hasPngBtn = await page.locator('button:has-text("PNG")').count() > 0;
  console.log('Has PNG button after file load:', hasPngBtn);
  const hasJpgBtn = await page.locator('button:has-text("JPG")').count() > 0;
  console.log('Has JPG button after file load:', hasJpgBtn);
  const hasWebpBtn = await page.locator('button:has-text("WEBP")').count() > 0;
  console.log('Has WEBP button after file load:', hasWebpBtn);
  
  // Check convert button appears
  const hasConvertBtn = await page.locator('button:has-text("Convert")').count() > 0;
  console.log('Has Convert button:', hasConvertBtn);
  
  console.log('\n✅ UI smoke test complete');
  console.log('Console errors:', logs.length);
  logs.slice(0, 3).forEach(l => console.log('  ', l.substring(0, 200)));
  
  await browser.close();
})();