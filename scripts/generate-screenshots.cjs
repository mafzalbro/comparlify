const { chromium } = require('playwright');
const fs = require('fs');

async function loginAsAdmin(page, baseUrl) {
  try {
    console.log('Navigating to login page for Admin authentication...');
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle', timeout: 30000 });
    const adminBtn = page.getByRole('button', { name: /Direct Login as Admin/i });
    if (await adminBtn.isVisible()) {
      console.log('Clicking "Direct Login as Admin"...');
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/auth') || res.status() === 200, { timeout: 15000 }).catch(() => {}),
        adminBtn.click()
      ]);
      await page.waitForTimeout(2000);
      console.log('Successfully logged in as Admin!');
    }
  } catch (err) {
    console.error('Failed to auto-login as admin:', err.message);
  }
}

async function preparePageForScreenshot(page, routePath, isMobile) {
  // Dismiss/accept cookies if accept button is present
  try {
    const acceptBtn = page.getByRole('button', { name: /Accept/i });
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(300);
    }
  } catch (e) {}

  // Inject browser bar and clean overlays
  await page.evaluate(({ routePath, isMobile }) => {
    // 1. Hide cookie consent banner & toasts
    const cookieBanners = document.querySelectorAll('div.fixed.bottom-0, [class*="toast"], [class*="cookie"]');
    cookieBanners.forEach(el => {
      if (el) el.style.display = 'none';
    });

    localStorage.setItem('cookie-consent', 'true');

    // 2. Remove any previously injected route address bar
    const oldBar = document.getElementById('playwright-browser-address-bar');
    if (oldBar) oldBar.remove();

    // 3. Inject mock browser address bar with route name
    const bar = document.createElement('div');
    bar.id = 'playwright-browser-address-bar';
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.right = '0';
    bar.style.zIndex = '9999999';
    bar.style.background = '#0f172a';
    bar.style.borderBottom = '1px solid #334155';
    bar.style.padding = isMobile ? '6px 10px' : '8px 16px';
    bar.style.display = 'flex';
    bar.style.alignItems = 'center';
    bar.style.gap = '10px';
    bar.style.fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
    bar.style.fontSize = isMobile ? '11px' : '13px';
    bar.style.color = '#e2e8f0';
    bar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';

    bar.innerHTML = `
      <div style="display: flex; gap: 6px; align-items: center; shrink: 0;">
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444; display: inline-block;"></span>
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b; display: inline-block;"></span>
        <span style="width: 10px; height: 10px; border-radius: 50%; background: #22c55e; display: inline-block;"></span>
      </div>
      <div style="flex: 1; background: #1e293b; border-radius: 6px; padding: 5px 12px; border: 1px solid #475569; display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
        <span style="color: #22c55e; font-size: 12px;">🔒</span>
        <span style="color: #94a3b8;">https://</span>
        <span style="color: #f8fafc; font-weight: 600;">comparlify.com</span>
        <span style="color: #38bdf8; font-weight: 700;">${routePath}</span>
      </div>
    `;

    document.body.prepend(bar);
    document.body.style.paddingTop = isMobile ? '46px' : '54px';
  }, { routePath, isMobile });
}

async function run() {
  console.log('Launching browser for screenshot capture...');
  const browser = await chromium.launch();

  // Create target directories
  fs.mkdirSync('screenshots/desktop_dark', { recursive: true });
  fs.mkdirSync('screenshots/mobile_dark', { recursive: true });

  if (fs.existsSync('public/screenshots')) {
    fs.rmSync('public/screenshots', { recursive: true, force: true });
    console.log('Removed public/screenshots directory.');
  }

  const routes = [
    { name: '1_homepage', path: '/', requiresAuth: false },
    { name: '2_methodology', path: '/methodology', requiresAuth: false },
    { name: '3_alternatives_directory', path: '/alternatives', requiresAuth: false },
    { name: '4_alternatives_ghost', path: '/alternatives/ghost', requiresAuth: false },
    { name: '5_migration_playbook', path: '/migrate/substack-to-ghost', requiresAuth: false },
    { name: '6_platform_ghost', path: '/platform/ghost', requiresAuth: false },
    { name: '7_data_health_admin', path: '/admin/data-health', requiresAuth: true },
    { name: '8_reviews_admin', path: '/admin/reviews', requiresAuth: true }
  ];

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  // Desktop context
  console.log('--- Capturing Desktop screenshots ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();

  let desktopLoggedIn = false;

  for (const r of routes) {
    try {
      if (r.requiresAuth && !desktopLoggedIn) {
        await loginAsAdmin(desktopPage, baseUrl);
        desktopLoggedIn = true;
      }
      const res = await desktopPage.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      if (res && res.status() >= 400) {
        console.error(`Warning: Desktop ${r.name} returned HTTP ${res.status()}`);
      }
      await desktopPage.waitForTimeout(1000);
      await preparePageForScreenshot(desktopPage, r.path, false);
      await desktopPage.waitForTimeout(500);
      await desktopPage.screenshot({ path: `screenshots/desktop_dark/${r.name}.png`, fullPage: false });
      console.log(`Saved desktop dark: ${r.name}`);
    } catch (err) {
      console.error(`Failed capturing desktop screenshot for ${r.path}:`, err.message);
    }
  }

  // Mobile context (375x812)
  console.log('--- Capturing Mobile screenshots ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true
  });
  const mobilePage = await mobileContext.newPage();

  let mobileLoggedIn = false;

  for (const r of routes) {
    try {
      if (r.requiresAuth && !mobileLoggedIn) {
        await loginAsAdmin(mobilePage, baseUrl);
        mobileLoggedIn = true;
      }
      const res = await mobilePage.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      if (res && res.status() >= 400) {
        console.error(`Warning: Mobile ${r.name} returned HTTP ${res.status()}`);
      }
      await mobilePage.waitForTimeout(1000);
      await preparePageForScreenshot(mobilePage, r.path, true);
      await mobilePage.waitForTimeout(500);
      await mobilePage.screenshot({ path: `screenshots/mobile_dark/${r.name}.png`, fullPage: false });
      console.log(`Saved mobile dark: ${r.name}`);
    } catch (err) {
      console.error(`Failed capturing mobile screenshot for ${r.path}:`, err.message);
    }
  }

  // Also store top-level copies in screenshots/ for easy access
  for (const r of routes) {
    try {
      if (r.requiresAuth && !mobileLoggedIn) {
        await loginAsAdmin(mobilePage, baseUrl);
        mobileLoggedIn = true;
      }
      await mobilePage.goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      await mobilePage.waitForTimeout(1000);
      await preparePageForScreenshot(mobilePage, r.path, true);
      await mobilePage.waitForTimeout(500);
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
