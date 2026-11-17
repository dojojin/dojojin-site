// Render a 1600x1200 cover HTML to JPEG: node scripts/content/render_cover.mjs in.html out.jpg
import { chromium } from 'playwright';
import { resolve } from 'node:path';
const [inp, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1600, height: 1200 } });
await p.goto('file://' + resolve(inp));
await p.waitForTimeout(500);
await p.screenshot({ path: out, type: 'jpeg', quality: 88 });
await b.close();
