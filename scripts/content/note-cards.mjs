// Turn the side "note" boxes of a post into designed info-card images (owner request 2026-11-11).
// Usage: node scripts/content/note-cards.mjs src/content/posts/news/<slug>.mdx [...more]
// - Renders each <div class="note">…</div> (without links) to public/media/posts/<type>/<slug>/note-N.jpg
//   with headless Chromium (real Thai font, so spelling is exact), 1600px wide (640 CSS px at 2.5x, so text stays readable when shown at half width).
// - Replaces the box with <figure class="split-fig"> whose alt holds the full text (search + screen readers).
// - Alternates sides: in every 2nd .split the figure is moved before the prose.
// - Boxes that contain links are left as text (links must stay clickable). Idempotent: converted posts have no notes left.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
const plain = (s) => s.replace(/\*\*/g, '').replace(/^#+\s*/gm, '').replace(/\s+/g, ' ').trim();

function cardHtml(md) {
  const blocks = md.trim().split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  let title = '';
  const rows = [];
  for (const b of blocks) {
    if (b.startsWith('###')) { title = b.replace(/^#+\s*/, ''); continue; }
    if (/^[-*] /m.test(b)) { rows.push({ list: b.split('\n').map((l) => l.replace(/^[-*]\s*/, '')) }); continue; }
    const m = b.match(/^\*\*(.+?):?\*\*:?\s*([\s\S]*)$/);
    if (m && m[2]) rows.push({ label: m[1].replace(/:$/, ''), value: m[2] });
    else rows.push({ text: b });
  }
  const body = rows.map((r) => r.list ? `<ul>${r.list.map((l) => `<li>${inline(l)}</li>`).join('')}</ul>`
    : r.label ? `<div class="row"><span class="lab">${inline(r.label)}</span><span class="val">${inline(r.value)}</span></div>`
    : `<p>${inline(r.text)}</p>`).join('');
  return `<!doctype html><html lang="th"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:640px;font-family:'IBM Plex Sans Thai',sans-serif;color:#1c2321;background:#fff}
.card{background:linear-gradient(160deg,#ffffff 55%,#eef6f2 100%);padding:30px 30px 18px;position:relative;overflow:hidden}
.card:before{content:"";position:absolute;inset:0 0 auto 0;height:8px;background:linear-gradient(90deg,#0f6b55,#3d7be0)}
.kick{display:inline-block;font-size:14px;font-weight:700;letter-spacing:.06em;color:#0f6b55;background:#e3f2ec;border-radius:999px;padding:4px 14px}
h3{font-size:30px;line-height:1.3;margin:10px 0 14px}
.row{display:grid;grid-template-columns:1fr;gap:2px;padding:11px 0;border-top:1px solid #e7ebe9}
.lab{font-size:16px;font-weight:700;color:#0f6b55}
.val{font-size:22px;line-height:1.45;font-weight:600}
p{font-size:20px;line-height:1.6;padding:10px 0;border-top:1px solid #e7ebe9;color:#2b3431}
ul{padding:8px 0 4px 24px;border-top:1px solid #e7ebe9}li{font-size:20px;line-height:1.55;margin:6px 0}
b{color:#0f6b55}
.foot{margin-top:10px;font-size:12px;color:#7a857f;text-align:right;letter-spacing:.04em}
</style></head><body><div class="card"><span class="kick">DOJOJIN.TECH</span>${title ? `<h3>${inline(title)}</h3>` : ''}${body}</div></body></html>`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 600 }, deviceScaleFactor: 2.5 });
const SPLIT = /<div class="split">\n([\s\S]*?)\n<\/div>\n(?=\n|<\/section>)/g;
const NOTE = /<div class="note">([\s\S]*?)<\/div>\n?/;
for (const file of process.argv.slice(2)) {
  let src = readFileSync(file, 'utf8');
  const [, type, slug] = file.match(/posts\/([^/]+)\/([^/]+)\.mdx$/);
  const outDir = `public/media/posts/${type}/${slug}`;
  mkdirSync(outDir, { recursive: true });
  // pass 1: render every convertible note (in order)
  const figs = [];
  for (const [, inner] of src.matchAll(SPLIT)) {
    const m = inner.match(NOTE);
    if (!m || /<a\s|\]\(/.test(m[1])) continue;
    const name = `note-${figs.length + 1}.jpg`;
    await page.setViewportSize({ width: 640, height: 600 });
    await page.setContent(cardHtml(m[1]), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const h = await page.evaluate(() => document.body.scrollHeight);
    await page.setViewportSize({ width: 640, height: h });
    await page.screenshot({ path: `${outDir}/${name}`, type: 'jpeg', quality: 88 });
    figs.push(`<figure class="split-fig"><img src="/media/posts/${type}/${slug}/${name}" width="1600" height="${Math.round(h * 2.5)}" loading="lazy" alt="${esc(plain(m[1]))}" /></figure>\n`);
  }
  // pass 2: swap note -> figure; every 2nd converted split puts the figure on the left
  let k = 0;
  src = src.replace(SPLIT, (whole, inner) => {
    const m = inner.match(NOTE);
    if (!m || /<a\s|\]\(/.test(m[1])) return whole;
    const fig = figs[k++];
    const rest = inner.replace(m[0], '').replace(/\n+$/, '');
    return `<div class="split">\n${k % 2 === 0 ? fig + rest : rest + '\n' + fig.trimEnd()}\n</div>\n`;
  });
  writeFileSync(file, src);
  console.log(file, `${figs.length} card(s)`);
}
await browser.close();
