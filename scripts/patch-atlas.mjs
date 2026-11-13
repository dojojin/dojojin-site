// Turn a standalone "Price Atlas" HTML file into a page of dojojin.tech/<type>/<slug>/ (type from src/data/atlases.js, i.e. /data/).
// The atlas's own scripts and design are left untouched; we only:
//   1. apply data corrections from src/data/atlas-corrections/<slug>.json to window.__ATLAS__
//      (each entry's `old` must equal the current value, otherwise the script stops)
//   2. rewrite <head> metadata (canonical/og/twitter point at dojojin.tech, site favicon)
//   3. add a small responsive CSS patch (tested at 390 / 768 / 1280)
//   4. add the site top bar (same menu as src/layouts/Base.astro, the atlas's type (Data) active)
//      and a "ที่มาของรูป" link in the atlas's own menu
//
// Usage: node scripts/patch-atlas.mjs
// Input : _sources/data/<slug>.html + _sources/data/<slug>.og.png   (local, gitignored)
// Output: public/<type>/<slug>/index.html + public/<type>/<slug>/og.png
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { ATLASES } from '../src/data/atlases.js';
import { NAV } from '../src/data/site.js';

const SITE = 'https://dojojin.tech';
const FONTS_CSS = readFileSync('src/styles/fonts.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/* ---------- data corrections ---------- */

// End index (exclusive) of the JSON value starting at s[i] ('[' or '{'), string-aware.
function jsonEnd(s, i) {
  let depth = 0, inStr = false;
  for (let k = i; k < s.length; k++) {
    const c = s[k];
    if (inStr) { if (c === '\\') k++; else if (c === '"') inStr = false; continue; }
    if (c === '"') inStr = true;
    else if (c === '[' || c === '{') depth++;
    else if (c === ']' || c === '}') { if (--depth === 0) return k + 1; }
  }
  throw new Error('unterminated JSON');
}

// Path like `tiers[gb=256&variant=CN].thb` or `soc.name` → [parent, key] inside obj.
function resolve(obj, path) {
  const parts = path.match(/[^.[\]]+|\[[^\]]*\]/g);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = step(cur, parts[i], path);
  return [cur, parts[parts.length - 1]];
}
function step(cur, part, path) {
  if (!part.startsWith('[')) {
    if (cur[part] === undefined) throw new Error(`${path}: no key "${part}"`);
    return cur[part];
  }
  const conds = part.slice(1, -1).split('&').map((c) => c.split('='));
  const hits = cur.filter((el) => conds.every(([k, v]) => String(el[k] ?? null) === v));
  if (hits.length !== 1) throw new Error(`${path}: selector ${part} matched ${hits.length} items`);
  return hits[0];
}

function applyCorrections(models, fixes, slug) {
  const byId = Object.fromEntries(models.map((m) => [m.id, m]));
  for (const f of fixes) {
    const m = byId[f.id];
    if (!m) throw new Error(`${slug}: unknown model id ${f.id}`);
    if (f.op === 'add') { // append a whole element to an array, e.g. a missing price tier
      const [parent, key] = resolve(m, f.path);
      if (!Array.isArray(parent[key])) throw new Error(`${slug} ${f.id} ${f.path}: not an array`);
      parent[key].push(f.new); continue;
    }
    const [parent, key] = resolve(m, f.path);
    if (f.op === 'remove') { // drop a photo, matched by its Commons file URL instead of the whole embedded image
      if (parent[key]?.file_url !== f.old_file_url) throw new Error(`${slug} ${f.id} ${f.path}: file_url is not ${f.old_file_url}`);
      parent[key] = null; continue;
    }
    if (JSON.stringify(parent[key] ?? null) !== JSON.stringify(f.old)) {
      throw new Error(`${slug} ${f.id} ${f.path}: expected old ${JSON.stringify(f.old)}, found ${JSON.stringify(parent[key])}`);
    }
    // a photo given as a file (src/data/atlas-photos/<slug>/<id>.webp) is embedded like the atlas's own photos
    if (f.new?.src_file) {
      const { src_file, ...rest } = f.new;
      f.new = { src: `data:image/webp;base64,${readFileSync(`src/data/atlas-photos/${slug}/${src_file}`).toString('base64')}`, ...rest };
    }
    parent[key] = f.new;
  }
}

function patchData(html, slug) {
  const file = `src/data/atlas-corrections/${slug}.json`;
  const fixes = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const marker = 'window.__ATLAS__=';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`${slug}: window.__ATLAS__ not found`);
  const start = at + marker.length, end = jsonEnd(html, start);
  const models = JSON.parse(html.slice(start, end));
  applyCorrections(models, fixes, slug);
  // `</` must not appear raw inside <script>
  const json = JSON.stringify(models).replace(/<\//g, '<\\/');
  return { html: fixes.length ? html.slice(0, start) + json + html.slice(end) : html, models, count: fixes.length };
}

function stats(models) {
  const thb = models.flatMap((m) => (m.tiers || []).map((t) => t.thb).filter(Boolean));
  const yrs = models.map((m) => +String(m.announced).slice(0, 4)).filter(Boolean);
  return { models: models.length, years: `${Math.min(...yrs)}–${Math.max(...yrs)}`,
    photos: models.filter((m) => m.photo?.src).length, thbMin: Math.min(...thb), thbMax: Math.max(...thb) };
}

/* ---------- page text ---------- */

// Fixed text in the atlas's own strings (exact match required, so a new atlas version can't be patched blindly).
const TEXT_FIXES = {
  'vivo-x-price-atlas': [ // the price table compares THB with the China price (CNY), not a US price
    ['prices_p:"Every storage tier with its Thai launch price. THB/USD is the implied rate, shown only where the US price was a full unlocked price."',
     'prices_p:"Every storage tier with its Thai launch price and its China launch price (CNY). THB/CNY is the implied rate, shown only where both prices exist."'],
    ['prices_p:"ทุกความจุพร้อมราคาเปิดตัวในไทย ช่องบาท/ดอลลาร์คืออัตราที่คำนวณจากสองราคา แสดงเฉพาะรุ่นที่ราคาสหรัฐฯ เป็นราคาเครื่องเปล่า"',
     'prices_p:"ทุกความจุพร้อมราคาเปิดตัวในไทยและราคาเปิดตัวในจีน (หยวน) ช่องบาท/หยวนคืออัตราที่คำนวณจากสองราคา แสดงเฉพาะรุ่นที่มีทั้งสองราคา"'],
    ['col_usd">US price</th>', 'col_usd">ราคาจีน (หยวน)</th>'],
  ],
};
function patchText(html, slug) {
  for (const [from, to] of TEXT_FIXES[slug] || []) {
    if (!html.includes(from)) throw new Error(`${slug}: text to fix not found: ${from.slice(0, 60)}`);
    html = html.split(from).join(to);
  }
  return html;
}

/* ---------- page chrome ---------- */

const PATCH_CSS = `
/* dojojin.tech: site tone. Same neutrals, accent and fonts as src/styles/site.css; series/chip colours stay as the atlas made them. */
:root {
  --paper: #f7f7f5; --sheet: #ffffff; --ink: #1c1c1a; --ink-2: #5c5c57; --ink-3: #85857f;
  --rule: #e4e4e0; --grid: #efefec; --band: #f2f2ef;
  --accent: #00735f; --accent-soft: #e0f1ec;
  --display: 'IBM Plex Sans Thai', 'Noto Sans Thai', system-ui, sans-serif;
  --body: 'IBM Plex Sans Thai', 'Noto Sans Thai', system-ui, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --r: 12px;
}
body { background-image: none; }   /* the site has no graph-paper background */
h1, h2, h3 { letter-spacing: 0; }
/* dojojin.tech: responsive patch — grid children must be allowed to shrink */
.sheet, .year-row, .cards, .card, .card > * { min-width: 0; }
.cards { grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
.card > .sub, .card > span { max-width: 100%; }
/* same page width + side gutter as the rest of the site (atlas default: 1280px, fixed 16px) */
.wrap { max-width: 1600px; padding-left: max(clamp(16px, 4vw, 64px), env(safe-area-inset-left, 0px));
  padding-right: max(clamp(16px, 4vw, 64px), env(safe-area-inset-right, 0px)); }
@media (max-width: 760px) {
  .bar .wrap { flex-wrap: wrap; row-gap: 6px; }
  .bar .nav { order: 3; flex: 1 1 100%; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
  .bar .nav::-webkit-scrollbar { display: none; }
  .bar .nav a { white-space: nowrap; }
}
/* dojojin.tech: site top bar (mirrors .site-bar / .site-nav in src/styles/site.css) */
body { margin: 0; }  /* browser default 8px would inset the top bar */
/* both bars stay pinned: site bar at the very top, the atlas's own bar right under it.
   --dj-h is the site bar's live height (set by the small script injected with the bar). */
.dj-bar { position: sticky; top: 0; z-index: 60; }
.bar { top: var(--dj-h, 0px) !important; }
html { scroll-padding-top: calc(var(--dj-h, 0px) + 72px); }
@media (max-width: 760px) {
  .bar { position: static !important; }   /* phones: pin only the site bar, keep the screen for content */
  html { scroll-padding-top: calc(var(--dj-h, 0px) + 12px); }
}
.dj-bar { background: color-mix(in srgb, #fff 90%, transparent); backdrop-filter: blur(8px); border-bottom: 1px solid #e4e4e0;
  font: 400 clamp(0.8125rem, 0.78rem + 0.1vw, 0.875rem)/1.6 'IBM Plex Sans Thai', 'Noto Sans Thai', system-ui, sans-serif; }
.dj-bar * { box-sizing: border-box; }
.dj-wrap { max-width: 1600px; margin: 0 auto; padding: 12px clamp(16px, 4vw, 64px);
  display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.dj-brand { display: inline-flex; align-items: center; gap: 8px; flex: none; color: #1c1c1a; text-decoration: none;
  font-weight: 700; letter-spacing: .08em; }
.dj-brand img { width: 28px; height: 28px; border-radius: 50%; display: block; }
.dj-nav { display: flex; gap: 4px; min-width: 0; overflow-x: auto; scrollbar-width: none; }
.dj-nav a { padding: 8px 12px; white-space: nowrap; color: #1c1c1a; text-decoration: none; font-weight: 600;
  font-size: clamp(1rem, 0.95rem + 0.2vw, 1.125rem); box-shadow: inset 0 -3px 0 transparent; transition: box-shadow .15s ease, color .15s ease; }
.dj-nav a:hover { color: #00735f; box-shadow: inset 0 -3px 0 #e4e4e0; }
.dj-nav a[aria-current="page"] { color: #00735f; font-weight: 700; box-shadow: inset 0 -3px 0 #00735f; }
.dj-brand:focus-visible, .dj-nav a:focus-visible { outline: 3px solid #00735f; outline-offset: 2px; }
@media (max-width: 768px) {
  .dj-wrap { flex-wrap: wrap; row-gap: 8px; }
  .dj-nav { width: 100%; flex-wrap: wrap; overflow: visible; margin-left: -12px; }
  .dj-nav a { padding: 4px 8px; }
}
`;

const topBar = (active) => `
<div class="dj-bar">
  <div class="dj-wrap">
    <a class="dj-brand" href="/"><img src="/logo-80.webp" alt="" width="28" height="28">DOJOJIN.TECH</a>
    <div class="dj-nav" role="navigation" aria-label="เมนูหลัก">
      ${NAV.map(([id, href, label]) => `<a href="${href}"${id === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
    </div>
  </div>
</div>
<script>
  (() => { const b = document.querySelector('.dj-bar');
    const set = () => document.documentElement.style.setProperty('--dj-h', b.offsetHeight + 'px');
    set(); new ResizeObserver(set).observe(b); })();
</script>`;

function patchPage(html, a) {
  const url = `${SITE}/${a.type}/${a.slug}/`;
  // drop metadata that pointed at the upload host (or was wrong, e.g. og:title = file name)
  html = html.replace(/\s*<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*"|name="description")[^>]*>/g, '');
  html = html.replace(/\s*<link\s+rel="(?:canonical|icon)"[^>]*>/g, '');
  // fonts come from the site (public/fonts, font-display: optional), never from fonts.googleapis.com (render-blocking, CLS)
  html = html.replace(/\s*<link\s+rel="(?:preconnect|stylesheet)"\s+href="https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g, '');
  const head = `
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preload" href="/fonts/ibm-plex-sans-thai-400-thai.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/ibm-plex-sans-thai-400-latin.woff2" as="font" type="font/woff2" crossorigin>
<style id="dojojin-fonts">${FONTS_CSS}</style>
<meta name="description" content="${esc(a.description)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="DOJOJIN.TECH">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(a.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${url}og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="th_TH">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(a.title)}">
<meta name="twitter:description" content="${esc(a.description)}">
<meta name="twitter:image" content="${url}og.png">
<style id="dojojin-patch">${PATCH_CSS}</style>
`;
  if (!/<\/head>/i.test(html) || !/<body[^>]*>/i.test(html)) throw new Error(`${a.slug}: no </head> or <body>`);
  html = html.replace(/<\/head>/i, `${head}</head>`);
  html = html.replace(/<body([^>]*)>/i, (m) => `${m}${topBar(a.type)}`);
  // the atlas's own section menu: add a direct link to the photo credits
  const navEnd = html.indexOf('</nav>', html.indexOf('class="nav"'));
  if (navEnd < 0) throw new Error(`${a.slug}: atlas nav not found`);
  html = html.slice(0, navEnd) + '<a href="#credits">ที่มาของรูป</a>' + html.slice(navEnd);
  return html;
}

for (const a of ATLASES) {
  const out = `public/${a.type}/${a.slug}`;
  mkdirSync(out, { recursive: true });
  const { html: data, models, count } = patchData(readFileSync(`_sources/data/${a.slug}.html`, 'utf8'), a.slug);
  const html = patchPage(patchText(data, a.slug), a);
  writeFileSync(`${out}/index.html`, html);
  copyFileSync(`_sources/data/${a.slug}.og.png`, `${out}/og.png`);
  const s = stats(models);
  const drift = ['models', 'years', 'photos', 'thbMin', 'thbMax'].filter((k) => s[k] !== a[k]);
  console.log(`${a.slug}: ${count} corrections, ${Math.round(html.length / 1024)} KB → ${out}/index.html`,
    drift.length ? `\n  ⚠ atlases.js out of date: ${drift.map((k) => `${k} ${a[k]} → ${s[k]}`).join(', ')}` : '');
}
