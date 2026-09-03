const { chromium } = require('playwright');
const fs = require('fs');

async function run() {
  console.log('Launching browser for screenshot capture...');
  const browser = await chromium.launch();

  // Create target directories (only in screenshots/)
  fs.mkdirSync('screenshots/desktop_dark', { recursive: true });
  fs.mkdirSync('screenshots/mobile_dark', { recursive: true });

  // Clean up public/screenshots directory if it exists
  if (fs.existsSync('public/screenshots')) {
    fs.rmSync('public/screenshots', { recursive: true, force: true });
    console.log('Removed public/screenshots directory.');
  }

  const routes = [
    { name: '1_homepage', path: '/' },
    { name: '2_methodology', path: '/methodology' },
    { name: '3_alternatives_directory', path: '/alternatives' },
    { name: '4_alternatives_ghost', path: '/alternatives/ghost' },
    { name: '5_migration_playbook', path: '/migrate/substack-to-ghost' },
    { name: '6_platform_ghost', path: '/platform/ghost' },
    { name: '7_data_health_admin', path: '/admin/data-health' },
    { name: '8_reviews_admin', path: '/admin/reviews' }
  ];

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Desktop context
  console.log('Capturing Desktop screenshots...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();

  for (const r of routes) {
    try {
      const res = await desktopPage.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      if (res && res.status() >= 400) {
        console.error(`Warning: Desktop ${r.name} returned HTTP ${res.status()}`);
      }
      await desktopPage.waitForTimeout(1500);
      await desktopPage.screenshot({ path: `screenshots/desktop_dark/${r.name}.png`, fullPage: false });
      console.log(`Saved desktop dark: ${r.name}`);
    } catch (err) {
      console.error(`Failed capturing desktop screenshot for ${r.path}:`, err.message);
    }
  }

  // Mobile context (375x812 - iPhone 12 Pro size)
  console.log('Capturing Mobile screenshots...');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();

  for (const r of routes) {
    try {
      const res = await mobilePage.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      if (res && res.status() >= 400) {
        console.error(`Warning: Mobile ${r.name} returned HTTP ${res.status()}`);
      }
      await mobilePage.waitForTimeout(1500);
      await mobilePage.screenshot({ path: `screenshots/mobile_dark/${r.name}.png`, fullPage: false });
      console.log(`Saved mobile dark: ${r.name}`);
    } catch (err) {
      console.error(`Failed capturing mobile screenshot for ${r.path}:`, err.message);
    }
  }

  // Also store top-level copies in screenshots/ for easy access
  for (const r of routes) {
    try {
      await mobilePage.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await mobilePage.waitForTimeout(1500);
      await mobilePage.screenshot({ path: `screenshots/mobile_${r.name}.png`, fullPage: false });
      console.log(`Saved top-level mobile copy: ${r.name}`);
    } catch (err) {
      console.error(`Failed capturing top-level mobile screenshot for ${r.path}:`, err.message);
    }
  }

  await browser.close();
  console.log('Screenshot generation complete!');
}

run().catch(console.error);
