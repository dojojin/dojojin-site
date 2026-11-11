// Render one infographic HTML (640 CSS px wide, uses infographic/base.css) to a 1600px-wide JPG.
// Usage: node scripts/content/render-infographic.mjs <in.html> <out.jpg>   → prints "WxH" of the JPG.
import { chromium } from 'playwright';
import { resolve, dirname, join } from 'node:path';
import { existsSync } from 'node:fs';
const [inp, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 640, height: 100 }, deviceScaleFactor: 2.5 });
await p.goto('file://' + resolve(inp), { waitUntil: 'networkidle' });
// Illustrated look (owner 2026-11-11): if the folder has bg.png (Codex illustration, no text),
// lay it behind the infographic and turn the tiles into frosted glass so the data stays readable.
const bg = join(dirname(resolve(inp)), 'bg.png');
if (existsSync(bg)) await p.addStyleTag({ content: `
  .ig{background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.25) 40%,rgba(255,255,255,.55)),url('file://${bg}') center/cover no-repeat !important}
  .tile,.card,[class*=tile],[class*=card]{background:rgba(255,255,255,.80) !important;backdrop-filter:blur(10px);border-color:rgba(255,255,255,.9) !important;box-shadow:0 8px 24px rgba(30,40,70,.10)}
  h2{text-shadow:0 1px 0 rgba(255,255,255,.8)}` });
await p.evaluate(() => document.fonts.ready);
const h = await p.evaluate(() => Math.ceil(document.body.getBoundingClientRect().height));
await p.setViewportSize({ width: 640, height: h });
await p.screenshot({ path: out, type: 'jpeg', quality: 90 });
await b.close();
console.log(`1600x${Math.round(h * 2.5)}`);
