#!/usr/bin/env node
// Check pages in a real browser at 390 / 768 / 1280 px.
// usage: node scripts/content/check_pages.mjs <base-url> [route ...]
//   no routes  → every URL in <base>/sitemap-0.xml
//   e.g. node scripts/content/check_pages.mjs http://localhost:4173 /review/new-post/ /review/
// Checks: HTTP 200, no horizontal overflow, no JS errors, no 4xx/5xx asset, gallery images load,
// the photo modal opens (pages with a gallery). Prints one line per problem; exit 1 if any.
// Screenshots (full page, 390 / 768 / 1280) of the FIRST route go to /tmp/dojojin-intake/check-*.png — look at them.
// Note: every run is a new browser session, so on a deployed site it adds 1 to the visitor counter.
import { chromium } from 'playwright';

const [base, ...given] = process.argv.slice(2);
if (!base) { console.error('usage: node scripts/content/check_pages.mjs <base-url> [route ...]'); process.exit(2); }
let routes = given;
if (!routes.length) {
  const xml = await (await fetch(`${base}/sitemap-0.xml`)).text();
  routes = [...xml.matchAll(/<loc>https?:\/\/[^/]+([^<]*)<\/loc>/g)].map((m) => m[1]);
}
const browser = await chromium.launch();
const problems = [];
for (const width of [390, 768, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('pageerror', (e) => problems.push(`${width} ${page.url()} JS error: ${e.message}`));
  page.on('response', (r) => { if (r.status() >= 400 && r.url().startsWith(base)) problems.push(`${width} ${r.status()} ${r.url()}`); });
  for (const [i, route] of routes.entries()) {
    const res = await page.goto(base + route, { waitUntil: 'load' });
    if (res.status() !== 200) { problems.push(`${width} ${route} HTTP ${res.status()}`); continue; }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (overflow > 0) problems.push(`${width} ${route} horizontal overflow ${overflow}px`);
    if (await page.locator('dialog').count() && await page.locator('.shot').count()) {
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); } });
      await page.waitForTimeout(500);
      const broken = await page.evaluate(() => [...document.querySelectorAll('.shot img')].filter((x) => !x.naturalWidth).map((x) => x.src));
      broken.forEach((src) => problems.push(`${width} ${route} image did not load: ${src}`));
      await page.locator('.shot').first().click();
      await page.waitForTimeout(300);
      if (!(await page.evaluate(() => !!document.querySelector('dialog[open]')))) problems.push(`${width} ${route} modal did not open`);
      await page.keyboard.press('Escape');
    }
    if (i === 0) await page.screenshot({ path: `/tmp/dojojin-intake/check-${width}.png`, fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`${routes.length} routes × 3 widths: ${problems.length ? problems.length + ' problem(s)' : 'all OK'}`);
[...new Set(problems)].forEach((p) => console.log('  ' + p));
process.exit(problems.length ? 1 : 0);
