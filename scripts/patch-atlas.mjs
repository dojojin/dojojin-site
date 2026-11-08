// Turn a standalone "Price Atlas" HTML file into a page of dojojin.tech/data/.
// The atlas's own scripts and design are left untouched; we only:
//   1. apply data corrections from src/data/atlas-corrections/<slug>.json to window.__ATLAS__
//      (each entry's `old` must equal the current value, otherwise the script stops)
//   2. rewrite <head> metadata (canonical/og/twitter point at dojojin.tech, site favicon)
//   3. add a small responsive CSS patch (tested at 390 / 768 / 1280)
//   4. add the site top bar (same menu as src/layouts/Base.astro, "Data" active)
//      and a "ที่มาของรูป" link in the atlas's own menu
//
// Usage: node scripts/patch-atlas.mjs
// Input : _sources/data/<slug>.html + _sources/data/<slug>.og.png   (local, gitignored)
// Output: public/data/<slug>/index.html + public/data/<slug>/og.png
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { ATLASES } from '../src/data/atlases.js';
import { NAV, DOCS_URL } from '../src/data/site.js';

const SITE = 'https://dojojin.tech';
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
    if (JSON.stringify(parent[key] ?? null) !== JSON.stringify(f.old)) {
      throw new Error(`${slug} ${f.id} ${f.path}: expected old ${JSON.stringify(f.old)}, found ${JSON.stringify(parent[key])}`);
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

/* ---------- page chrome ---------- */

const PATCH_CSS = `
/* dojojin.tech: responsive patch — grid children must be allowed to shrink */
.sheet, .year-row, .cards, .card, .card > * { min-width: 0; }
.cards { grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); }
.card > .sub, .card > span { max-width: 100%; }
@media (max-width: 760px) {
  .bar .wrap { flex-wrap: wrap; row-gap: 6px; }
  .bar .nav { order: 3; flex: 1 1 100%; flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; }
  .bar .nav::-webkit-scrollbar { display: none; }
  .bar .nav a { white-space: nowrap; }
}
/* dojojin.tech: site top bar (mirrors .site-bar in src/styles/site.css) */
body { margin: 0; }  /* browser default 8px would inset the top bar */
.dj-bar { background: #fff; border-bottom: 1px solid #e4e4e0; font: 400 14px/1.6 'Noto Sans Thai', 'IBM Plex Sans Thai', system-ui, sans-serif; }
.dj-bar * { box-sizing: border-box; }
.dj-wrap { max-width: 1600px; margin: 0 auto; padding: 12px clamp(16px, 4vw, 64px);
  display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.dj-brand { display: inline-flex; align-items: center; gap: 8px; flex: none; color: #1c1c1a; text-decoration: none;
  font-weight: 700; letter-spacing: .08em; }
.dj-brand img { width: 28px; height: 28px; border-radius: 8px; display: block; }
.dj-nav { display: flex; gap: 4px; min-width: 0; }
.dj-nav a { padding: 4px 12px; border-radius: 999px; white-space: nowrap; color: #5c5c57; text-decoration: none; font-weight: 600; }
.dj-nav a:hover { color: #1c1c1a; background: #efefec; }
.dj-nav a[aria-current="page"] { color: #0b6bcb; background: #efefec; }
.dj-brand:focus-visible, .dj-nav a:focus-visible { outline: 3px solid #0b6bcb; outline-offset: 2px; }
@media (max-width: 768px) {
  .dj-wrap { flex-wrap: wrap; row-gap: 8px; }
  .dj-nav { width: 100%; flex-wrap: wrap; margin-left: -12px; }
}
`;

const TOP_BAR = `
<div class="dj-bar">
  <div class="dj-wrap">
    <a class="dj-brand" href="/"><img src="/favicon.svg" alt="" width="28" height="28">DOJOJIN.TECH</a>
    <div class="dj-nav" role="navigation" aria-label="เมนูหลัก">
      ${NAV.map(([id, href, label]) => `<a href="${href}"${id === 'data' ? ' aria-current="page"' : ''}>${label}</a>`).join('')}
      <a href="${DOCS_URL}" rel="noopener">Docs</a>
    </div>
  </div>
</div>`;

function patchPage(html, a) {
  const url = `${SITE}/data/${a.slug}/`;
  // drop metadata that pointed at the upload host (or was wrong, e.g. og:title = file name)
  html = html.replace(/\s*<meta\s+(?:property="og:[^"]*"|name="twitter:[^"]*"|name="description")[^>]*>/g, '');
  html = html.replace(/\s*<link\s+rel="(?:canonical|icon)"[^>]*>/g, '');
  const head = `
<link rel="canonical" href="${url}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700&display=swap">
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
  html = html.replace(/<body([^>]*)>/i, (m) => `${m}${TOP_BAR}`);
  // the atlas's own section menu: add a direct link to the photo credits
  const navEnd = html.indexOf('</nav>', html.indexOf('class="nav"'));
  if (navEnd < 0) throw new Error(`${a.slug}: atlas nav not found`);
  html = html.slice(0, navEnd) + '<a href="#credits">ที่มาของรูป</a>' + html.slice(navEnd);
  return html;
}

for (const a of ATLASES) {
  const out = `public/data/${a.slug}`;
  mkdirSync(out, { recursive: true });
  const { html: data, models, count } = patchData(readFileSync(`_sources/data/${a.slug}.html`, 'utf8'), a.slug);
  const html = patchPage(data, a);
  writeFileSync(`${out}/index.html`, html);
  copyFileSync(`_sources/data/${a.slug}.og.png`, `${out}/og.png`);
  const s = stats(models);
  const drift = ['models', 'years', 'photos', 'thbMin', 'thbMax'].filter((k) => s[k] !== a[k]);
  console.log(`${a.slug}: ${count} corrections, ${Math.round(html.length / 1024)} KB → ${out}/index.html`,
    drift.length ? `\n  ⚠ atlases.js out of date: ${drift.map((k) => `${k} ${a[k]} → ${s[k]}`).join(', ')}` : '');
}
