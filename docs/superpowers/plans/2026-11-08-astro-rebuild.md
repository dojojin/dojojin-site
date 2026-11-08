# DOJOJIN.TECH Astro Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn dojojin.tech from a single-file React SPA into a formal, light-theme multi-page site (Home / Projects / Reviews [Charger, Headphones] / About / Guestbook) with one real URL per page, while keeping every existing playful effect.

**Architecture:** Astro static site output to `dist/` (Cloudflare Pages settings unchanged). Formal pages are `.astro` files with zero JS by default. The old SPA is kept **whole** as a React island at `/lab` (nothing is rewritten, so nothing is lost). The guestbook and the global easter eggs are small React islands that reuse components already in `src/App.jsx`. Reviews are MDX files in an Astro content collection; the charger template built on 2026-11-08 (`public/reviews/`) becomes Astro components.

**Tech Stack:** Astro 7.3.8, @astrojs/react 7.0.1, @astrojs/mdx 8.0.3, @astrojs/sitemap 3.7.4, React 19 (existing), Firebase 12 (existing), Playwright (smoke check only).

## Global Constraints

- Node in this box is v22.23.1. Astro 7.4.x needs node >=22.23.4, so pin **astro@7.3.8** (node >=22.12.0). Pin exact versions, no `^`.
- Every installed version must be ≥ 2 weeks old at install time (supply-chain rule).
- Build command and output stay `npm run build` → `dist/` (Cloudflare Pages dashboard is not touched).
- `VITE_OWNER_EMAILS` must keep working without a dashboard change → `vite.envPrefix: ['PUBLIC_', 'VITE_']`.
- Formal pages: light theme only, tokens on `:root`, 4px spacing grid, no emoji as UI (SVG icons), ≤768px is first-class (design.md).
- Owner's review wording is kept verbatim; thresholds are never changed by us.
- No push to `main`. Work on branch `astro-rebuild`. Every commit needs owner confirmation (working-standards §4).
- Before the first commit: this box has no git identity. Owner decides (a) repo-local `git config user.name/user.email` and (b) whether commits carry the Co-Authored-By trailer.
- Rollback: tag `pre-astro-backup` (= b35ee96) and `~/backups/dojojin-site-spa-b35ee96.tar.gz`.

## Decisions baked into this plan (owner can override)

| # | Decision | Default |
|---|---|---|
| D1 | Where the chaos effects live | Old site 100% intact at `/lab`. On formal pages only: Konami popup, idle screensaver, logo ×5 → goes to `/lab`. |
| D2 | Guestbook look | Existing `CommentsPage` (dark terminal style) inside a dark panel on a light page. |
| D3 | Headphones category with 0 reviews | Shown in nav, category page shows an empty state line. |
| D4 | URL style | `/reviews/charger/ripple-guide/` (trailing slash, Astro default). |
| D5 | Visitor counter (writes to production Firestore) | Keep counting every visit on every page: `useVisitorCount()` runs inside `EasterEggs`. Display stays in `/lab`. |
| D6 | Review date shown publicly | `date` = FB post date from the owner (EXIF says 2026-04-01, which is the photo date, not the post date). |

## File Structure

| Path | Action | Responsibility |
|---|---|---|
| `astro.config.mjs` | create | Astro config, integrations, env prefix, dev host |
| `vite.config.js`, `index.html`, `src/main.jsx` | delete | replaced by Astro |
| `src/data/site.js` | create | `PROJECTS`, `CASE_STUDIES`, `EXPERIENCES`, `DOCS_URL`, `PROFILE` — moved out of App.jsx so .astro pages can read them |
| `src/App.jsx` | modify | import data from `src/data/site.js`; export `CommentsPage`, `EasterEggs`; use `DOCS_URL` |
| `src/styles/site.css` | create (from `public/reviews/review.css`) | tokens + all formal-page components |
| `src/layouts/Base.astro` | create | `<head>`/OG, site header + nav, footer, EasterEggs island |
| `src/components/Badge.astro` | create | tier badge (colour + icon + label) |
| `src/components/GradeTable.astro` | create | one 5-tier grade card |
| `src/components/ChargerCriteria.astro` | create | owner's 4 charger criteria (data + 4 GradeTables) |
| `src/components/ShotGallery.astro` | create | gallery + `<dialog>` viewer (from `public/reviews/review.js`) |
| `src/components/Icons.astro` | create | inline SVG sprite |
| `src/content.config.js` | create | `reviews` collection schema |
| `src/content/reviews/charger/ripple-guide.mdx` | create | first review body |
| `src/content/reviews/charger/ripple-guide.shots.json` | create | photo data A–F (from current HTML) |
| `src/pages/index.astro` | create | formal home |
| `src/pages/projects.astro` | create | projects + case studies |
| `src/pages/about.astro` | create | biography / experience |
| `src/pages/guestbook.astro` | create | CommentsPage island |
| `src/pages/lab.astro` | create | whole old SPA island |
| `src/pages/reviews/index.astro` | create | both categories + latest |
| `src/pages/reviews/[category]/index.astro` | create | category listing |
| `src/pages/reviews/[category]/[slug].astro` | create | review page |
| `src/pages/404.astro` | create | not-found page |
| `public/reviews/charger/img/*` | keep | already resized, EXIF-stripped |
| `public/reviews/review.css`, `review.js`, `charger/*.html` | delete | moved into components |
| `public/sitemap.xml` | delete | replaced by @astrojs/sitemap |
| `scripts/smoke.mjs` | create | the one runnable check |
| `CLAUDE.md`, `DEPLOYMENT.md` | modify | new structure/commands |

---

### Task 1: Branch, Astro scaffold, old SPA running at `/lab`

**Files:**
- Create: `astro.config.mjs`, `src/pages/lab.astro`, `src/pages/index.astro` (temporary stub)
- Modify: `package.json`
- Delete: `vite.config.js`, `index.html`, `src/main.jsx`

**Interfaces:**
- Produces: `npm run dev|build|preview` running Astro; `/lab` renders `DevChaosProfile` (default export of `src/App.jsx`).

- [ ] **Step 1: Branch, free port 4173, ignore Astro cache**

```bash
cd ~/dojojin-site && git switch -c astro-rebuild
printf '\n# Astro\n.astro/\n' >> .gitignore
echo 22.23.1 > .node-version          # Pages reads this; no dashboard NODE_VERSION needed
```
Stop the old background `vite preview` on port 4173 (TaskStop) before any `astro preview`. Start previews with the Bash tool's `run_in_background`, not `&`.

- [ ] **Step 2: Copy the old root `index.html` head into notes before deleting** — its `<title>`, `<meta>` and OG tags feed Task 2.

```bash
sed -n '1,40p' index.html
```

- [ ] **Step 3: Install (exact pins)**

```bash
npm i -E astro@7.3.8 @astrojs/react@7.0.1 @astrojs/mdx@8.0.3 @astrojs/sitemap@3.7.4
npm uninstall @vitejs/plugin-react
```
Expected: no `ERESOLVE`, no `EBADENGINE` for astro. If `@astrojs/react@7.0.1` asks for peer `oxc-transform-react`, install the exact peer version npm names, again checking it is ≥ 2 weeks old (`npm view <pkg> time`).

- [ ] **Step 4: `package.json` scripts**

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "lint": "eslint ."
}
```

- [ ] **Step 5: `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dojojin.tech',
  integrations: [react(), mdx(), sitemap()],
  server: { host: true },
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'],          // keep VITE_OWNER_EMAILS working on Pages
    server: { allowedHosts: ['.trycloudflare.com', '.ts.net'] },
  },
});
```

- [ ] **Step 6: `src/pages/lab.astro`**

```astro
---
import App from '../App.jsx';
import '../index.css';
---
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <link rel="icon" href="/favicon.svg" />
  <title>DOJOJIN.TECH // lab</title>
</head>
<body style="margin:0;background:#030b14">
  <App client:only="react" />
</body>
</html>
```

- [ ] **Step 7: Temporary `src/pages/index.astro`** (replaced in Task 4)

```astro
---
---
<html lang="th"><body><a href="/lab">lab</a></body></html>
```

- [ ] **Step 8: Delete replaced files**

```bash
git rm vite.config.js index.html src/main.jsx
```

- [ ] **Step 9: Verify**

```bash
npm run build    # then start `npx astro preview --host 0.0.0.0 --port 4173` with run_in_background
curl -s -o /dev/null -w "%{http_code}\n" http://100.89.1.29:4173/lab/
```
Expected: build OK, `200`. Open `/lab/` in a browser: the old site with every tab, Konami, logo ×5, screensaver, guestbook works exactly like before. `npm run lint` passes.

- [ ] **Step 10: STOP → owner confirms → commit** (stage by path; `public/reviews/` WIP and `docs/` go in a separate first commit `docs: add Astro rebuild plan and charger review prototype`)

```bash
git add .gitignore .node-version astro.config.mjs package.json package-lock.json src/pages vite.config.js index.html src/main.jsx
git commit -m "build: move to Astro, keep the old SPA intact at /lab"
```

---

### Task 2: Shared data, tokens, Base layout, global easter eggs

**Files:**
- Create: `src/data/site.js`, `src/styles/site.css`, `src/layouts/Base.astro`, `src/components/Icons.astro`
- Modify: `src/App.jsx` (lines 105-ish `OWNER_EMAILS` untouched; 148-237 data moved; 879 and 1553 docs URL; new `EasterEggs` export; `CommentsPage` export)

**Interfaces:**
- Produces: `import { PROJECTS, CASE_STUDIES, EXPERIENCES, DOCS_URL, PROFILE } from '../data/site.js'`
- Produces: `<Base title description image? active>` layout, slot = page body. `active` ∈ `'home'|'projects'|'reviews'|'about'|'guestbook'`.
- Produces: `export function EasterEggs()` and `export function CommentsPage()` from `src/App.jsx`.

- [ ] **Step 1: `src/data/site.js`** — cut `PROJECTS` (App.jsx:148-166), `CASE_STUDIES` (168-199) and `EXPERIENCES` (983-991) **verbatim** into this file, prefix each with `export`, and add:

```js
export const DOCS_URL = import.meta.env.PUBLIC_DOCS_URL || 'https://docs.dojojin.tech';
export const PROFILE = {
  name: 'Prakasit Rochanavipart',
  handle: 'Dojo-mAn',
  title: 'System Engineer',
  summary: 'สร้าง CCTV analytics หลายยี่ห้อ (Bosch · Hikvision · Dahua · ONVIF), real-time event systems และ infra — ตั้งแต่ ingester → dashboard → mobile, รันจริงบน production',
  email: 'dojojin@gmail.com',
  socials: { github: 'https://github.com/dojojin/', facebook: 'https://facebook.com/dojojin', linkedin: 'https://linkedin.com/in/prakasit' },
};
```
In the moved `PROJECTS`, replace every `"https://docs.dojojin.tech` prefix with `` `${DOCS_URL}`` template strings (6 links, same paths/anchors).

- [ ] **Step 2: `src/App.jsx`** — add at top:

```js
import { PROJECTS, CASE_STUDIES, EXPERIENCES, DOCS_URL } from "./data/site.js";
```
Replace the two literal `href="https://docs.dojojin.tech"` (lines ~879, ~1553) with `href={DOCS_URL}`. Change `function CommentsPage(` → `export function CommentsPage(`. Add after `useIdleTimer`'s consumers (anywhere above `DevChaosProfile`):

```jsx
/* Easter eggs for the formal pages. Logo element must carry data-logo. */
export function EasterEggs() {
  const [showKonami, setShowKonami] = useState(false);
  const clicks = useRef([]);
  useKonamiCode(useCallback(() => setShowKonami(true), []));
  const idle = useIdleTimer(60000);
  useVisitorCount();               // D5: every page visit still counts
  useEffect(() => {
    const el = document.querySelector("[data-logo]");
    if (!el) return;
    const h = () => {
      const now = Date.now();
      clicks.current = [...clicks.current, now].filter(t => now - t < 2500);
      if (clicks.current.length >= 5) window.location.href = "/lab/";
    };
    el.addEventListener("click", h);
    return () => el.removeEventListener("click", h);
  }, []);
  return (
    <>
      {idle && <Screensaver/>}
      {showKonami && <KonamiPopup onClose={() => setShowKonami(false)}/>}
    </>
  );
}
```
Verify: `grep -c "docs.dojojin.tech" src/App.jsx` → `0`.

- [ ] **Step 3: `src/styles/site.css`**

```bash
git mv public/reviews/review.css src/styles/site.css
```
Append (keyframes the overlays need outside the old SPA, plus nav):

```css
@keyframes statusBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes rgb-border  { 0%{border-color:rgba(0,255,180,0.4)} 33%{border-color:rgba(120,80,255,0.4)} 66%{border-color:rgba(0,180,255,0.4)} 100%{border-color:rgba(0,255,180,0.4)} }

.site-nav { display: flex; gap: var(--space-1); overflow-x: auto; scrollbar-width: none; }
.site-nav a {
  padding: var(--space-2) var(--space-3); border-radius: 999px; white-space: nowrap;
  color: var(--text-secondary); text-decoration: none; font-weight: 600;
}
.site-nav a:hover { color: var(--text-primary); background: var(--surface-sunken); }
.site-nav a[aria-current="page"] { color: var(--accent); background: var(--surface-sunken); }
.brand { display: inline-flex; align-items: center; gap: var(--space-2); }
.brand__logo { all: unset; cursor: pointer; width: 28px; height: 28px; border-radius: 8px; overflow: hidden; }
.brand__logo img { width: 100%; height: 100%; }
.site-footer .wrap { display: flex; flex-wrap: wrap; gap: var(--space-4); justify-content: space-between; }
.empty { color: var(--text-secondary); padding: var(--space-8) 0; }
@media (max-width: 768px) {
  .site-bar .wrap { flex-wrap: wrap; }
  .site-nav { width: 100%; }
}
```

- [ ] **Step 4: `src/components/Icons.astro`** — the sprite currently inline in `public/reviews/charger/ripple-guide.html` (symbols `icon-dot`, `icon-alert`, `icon-close`, `icon-prev`, `icon-next`, `icon-expand`) copied verbatim into one `<svg width="0" height="0" style="position:absolute" aria-hidden="true">…</svg>`.

- [ ] **Step 5: `src/layouts/Base.astro`**

```astro
---
import '../styles/site.css';
import Icons from '../components/Icons.astro';
import { EasterEggs } from '../App.jsx';
import { PROFILE, DOCS_URL } from '../data/site.js';
const { title, description = PROFILE.summary, image = '/og-image.png', active } = Astro.props;
const fullTitle = title ? `${title} — DOJOJIN.TECH` : 'DOJOJIN.TECH';
const ogImage = new URL(image, Astro.site).href;
const nav = [
  ['home', '/', 'Home'], ['projects', '/projects/', 'Projects'], ['reviews', '/reviews/', 'Reviews'],
  ['about', '/about/', 'About'], ['guestbook', '/guestbook/', 'Guestbook'],
];
---
<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
  <meta property="og:title" content={title ?? 'DOJOJIN.TECH'} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:type" content={Astro.props.ogType ?? 'website'} />
  <link rel="icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;600;700&family=JetBrains+Mono:wght@500;600&display=swap" />
</head>
<body>
  <Icons />
  <header class="site-bar">
    <div class="wrap">
      <span class="brand">
        <button class="brand__logo" type="button" data-logo aria-label="DOJOJIN logo"><img src="/favicon.svg" alt="" /></button>
        <a class="site-bar__brand" href="/">DOJOJIN.TECH</a>
      </span>
      <nav class="site-nav" aria-label="หลัก">
        {nav.map(([id, href, label]) => <a href={href} aria-current={active === id ? 'page' : undefined}>{label}</a>)}
        <a href={DOCS_URL} rel="noopener">Docs</a>
      </nav>
    </div>
  </header>
  <slot />
  <footer class="source site-footer">
    <div class="wrap">
      <span>© {new Date().getFullYear()} DOJOJIN.TECH</span>
      <span><a href="/lab/">/lab</a></span>
    </div>
  </footer>
  <EasterEggs client:only="react" />
</body>
</html>
```

- [ ] **Step 6: Verify** — temporary `src/pages/index.astro` switches to `<Base title="Home" active="home"><main class="wrap">ok</main></Base>`; `npm run build && npm run lint`; open `/`: header, nav, footer render; type ↑↑↓↓←→←→BA → Konami popup; click logo 5× → lands on `/lab/`; `/lab/` still identical to before (data moved, not changed).

- [ ] **Step 7: STOP → owner confirms → commit** `feat(site): shared data module, light layout, easter eggs on formal pages`

---

### Task 3: Reviews (collection, components, charger review migrated)

**Files:**
- Create: `src/content.config.js`, `src/components/{Badge,GradeTable,ChargerCriteria,ShotGallery}.astro`, `src/content/reviews/charger/ripple-guide.mdx`, `src/content/reviews/charger/ripple-guide.shots.json`, `src/pages/reviews/index.astro`, `src/pages/reviews/[category]/index.astro`, `src/pages/reviews/[category]/[slug].astro`
- Delete: `public/reviews/review.js`, `public/reviews/charger/index.html`, `public/reviews/charger/ripple-guide.html`

**Interfaces:**
- Consumes: `Base` layout, `site.css` classes (`.hero`, `.layout`, `.toc`, `.grade-card`, `.gallery`, `.viewer` …).
- Produces: collection `reviews`, entry id `charger/ripple-guide`. `CATEGORIES` (`{ charger: 'Charger', headphones: 'หูฟัง' }`) lives in `src/data/site.js` (added in this task's Step 1).
- Produces: `<Badge tier={1..5} label="ดีมาก" />`, `<GradeTable id title note? rows=[{tier,label,val,desc?}] />`, `<ChargerCriteria />`, `<ShotGallery shots={[...]} />` (shot shape = the JSON objects already in `ripple-guide.html`: `id, src, w, h, alt, readings, verdict, summary, score, caution?, analysis, screen`).

- [ ] **Step 1: `src/content.config.js`** — first append to `src/data/site.js`: `export const CATEGORIES = { charger: 'Charger', headphones: 'หูฟัง' };`

```js
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES } from './data/site.js';

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/reviews' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(Object.keys(CATEGORIES)),
    date: z.coerce.date(),
    description: z.string(),
    lead: z.string(),
    kicker: z.string(),
    meta: z.string(),
    cover: z.string(),
    coverAlt: z.string(),
    sourceUrl: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});
export const collections = { reviews };
```
If the build says `astro/zod` or `astro/loaders` is not exported, check the installed API with `grep -n '"./zod"\|"./loaders"' node_modules/astro/package.json` and use the path it lists.

- [ ] **Step 2: `src/components/Badge.astro`**

```astro
---
const { tier, label } = Astro.props;
---
<span class={`badge tier-${tier}`}><svg class="icon" aria-hidden="true"><use href={tier === 5 ? '#icon-alert' : '#icon-dot'} /></svg>{label}</span>
```

- [ ] **Step 3: `src/components/GradeTable.astro`**

```astro
---
import Badge from './Badge.astro';
const { id, title, sub, rows } = Astro.props;
---
<article class="grade-card" id={id}>
  <h3>{title} {sub && <small>{sub}</small>}</h3>
  <table class="grades"><tbody>
    {rows.map((r) => (
      <tr><td><Badge tier={r.tier} label={r.label} /></td><td><span class="val">{r.val}</span>{r.desc && <span class="desc">{r.desc}</span>}</td></tr>
    ))}
  </tbody></table>
  <slot />
</article>
```

- [ ] **Step 4: `src/components/ChargerCriteria.astro`** — rows copied verbatim from the 4 tables in `public/reviews/charger/ripple-guide.html` (owner's thresholds; do not edit values):

```astro
---
import GradeTable from './GradeTable.astro';
const T = (tier, label, val, desc) => ({ tier, label, val, desc });
const rippleMv = [T(1,'ดีมาก','< 30mV','(ไม่เกิน 40)'), T(2,'ดี','40–50mV'), T(3,'พอใช้','50–100mV'), T(4,'แก้ขัด','100–200mV','ใช้งานแก้ขัดครั้งคราวพอได้'), T(5,'อันตราย','> 200mV','ไม่ควรใช้')];
const freq = [T(1,'ดีมาก','> 150kHz'), T(2,'ดี','100–150kHz'), T(3,'พอใช้','65–100kHz'), T(4,'แก้ขัด','30–65kHz','ใช้งานแก้ขัดครั้งคราวพอได้'), T(5,'อันตราย','< 30kHz','ไม่ควรใช้เด็ดขาด ไม่วงจรเสื่อมก็ของเก๊')];
const pct = [T(1,'ดีมาก','≤ 0.5%','เอาไรมาใช้งานก็ดีหมด'), T(2,'ดี','0.5–1%','ใช้งานทั่วไป'), T(3,'พอใช้','1–3%','พอใช้งานได้แต่หลีกเลี่ยงอุปกรณ์ sensitive'), T(4,'แก้ขัด','3–5%','ใช้งานแก้ขัดครั้งคราวพอได้ เริ่มเสี่ยงอุปกรณ์เสียหาย'), T(5,'อันตราย','> 5%','ไม่ควรใช้เด็ดขาด')];
const acc = [T(1,'ดีมาก','< ±1%','5V → 4.95–5.05V'), T(2,'ดี','±3%','5V → 4.85–5.15V'), T(3,'พอใช้','±5%','5V → 4.75–5.25V'), T(4,'ไม่ควรใช้','±5–10%','5V → 4.5–5.5V'), T(5,'อันตราย','> ±10%','ถ้าฝืนใช้พังแน่ๆ')];
---
<ol class="criteria">
  <li><a href="#ripple-mv">VBUS Ripple (Absolute mV)</a></li>
  <li><a href="#switching-freq">Switching Frequency</a></li>
  <li><a href="#ripple-pct">Ripple เป็น % ของ Vbus</a></li>
  <li><a href="#voltage-acc">Voltage Accuracy</a></li>
</ol>
<div class="grade-grid">
  <GradeTable id="ripple-mv" title="1. VBUS Ripple (Absolute mV) P-P" rows={rippleMv}><slot name="ripple-mv" /></GradeTable>
  <GradeTable id="switching-freq" title="2. Switching Frequency" rows={freq}><slot name="switching-freq" /></GradeTable>
  <GradeTable id="ripple-pct" title="3. Ripple เป็น % ของ Vbus" rows={pct}>
    <div class="formula">Ripple % = (Ripple mV ÷ Vbus mV) × 100</div><slot name="ripple-pct" />
  </GradeTable>
  <GradeTable id="voltage-acc" title="4. Voltage Accuracy" sub="(ยกตัวอย่างจากไฟ 5V)" rows={acc}><slot name="voltage-acc" /></GradeTable>
</div>
```

- [ ] **Step 5: `src/components/ShotGallery.astro`** — markup = the `<div class="gallery">` + `<dialog class="viewer">…</dialog>` from `ripple-guide.html` copied verbatim; data passed as JSON; script = `public/reviews/review.js` with only the first lines changed:

```astro
---
const { shots } = Astro.props;
---
<div class="gallery" data-gallery></div>
<dialog class="viewer" aria-labelledby="viewer-title">
  <!-- paste the <div class="viewer__grid">…</div> from ripple-guide.html unchanged -->
</dialog>
<script type="application/json" id="shots" set:html={JSON.stringify(shots)}></script>
<script>
  // paste public/reviews/review.js here unchanged — it already reads #shots, .gallery and .viewer
</script>
```
(These two "paste" lines are literal copy instructions of existing files, not placeholders: copy `public/reviews/charger/ripple-guide.html` lines between `<dialog class="viewer"…>` and `</dialog>`, and the whole of `public/reviews/review.js`.)

- [ ] **Step 6: Shots JSON** — copy the array inside `<script type="application/json" id="shots">` of `ripple-guide.html` into `src/content/reviews/charger/ripple-guide.shots.json`, and change each `"src": "img/…"` to `"src": "/reviews/charger/img/…"`.

- [ ] **Step 7: `src/content/reviews/charger/ripple-guide.mdx`**

```mdx
---
title: "หัวชาร์จแบบไหนดี หรือไม่ดี?"
category: charger
date: 2026-04-01   # D6: replace with the FB post date from the owner
description: "วัด Ripple, Switching Frequency, Ripple % และ Voltage Accuracy — 4 สิ่งที่ใช้ประเมินว่าหัวชาร์จดีหรือไม่"
kicker: "สาระประจำวัน · Charger"
lead: "แน่นอนครับ หัวชาร์จที่ดี ต้องมีการจ่ายไฟที่นิ่ง ความผันผวน (Ripple) ของแรงดันไฟฟ้า ต้องมี พูดง่ายๆ คือวัด ความ \"ไม่เรียบ\" ของแรงดันไฟ ตอนเราชาร์จมือถือนี่แหละครับ"
meta: "Dojo-mAn Fotographer · ทดสอบด้วย POWER-Z"
cover: "/reviews/charger/img/img_1763.jpg"
coverAlt: "POWER-Z แสดงหน้า VBUS Ripple ขณะชาร์จ"
sourceUrl: "https://www.facebook.com/share/p/1PqARuNgiy/"
---
import ChargerCriteria from '../../../components/ChargerCriteria.astro';
import ShotGallery from '../../../components/ShotGallery.astro';
import shots from './ripple-guide.shots.json';
```
Then the body: copy every `<section class="section" id="…">` block of `ripple-guide.html` (intro, esr, criteria, analyze) **text verbatim**, converting:
- `class=` stays (MDX accepts `class` on HTML tags), `<br>` → `<br />`.
- the `#criteria` section's `<ol class="criteria">` + `<div class="grade-grid">…</div>` → `<ChargerCriteria>` with the owner's notes in named slots:

```mdx
<ChargerCriteria>
  <p slot="ripple-mv">ส่วนมากของแถมมากับมือถือ หรือ ของแท้ที่ขายตามศูนย์ จะมีค่า Ripple ประมาณ 35-50mV ซึ่งอยู่ในเกณฑ์ดีเลย ส่วนของแบรนด์ Top-Tier อย่าง Orsen, CUKTECH, Anker จากที่ผมทดสอบมาอยู่ราวๆ 20-30mV ถือว่าสบายใจได้ครับ</p>
  <p slot="switching-freq">ส่วนมาก GaN รุ่นใหม่ จะมี Frequency สูง มากกว่า 150kHz อยู่แล้ว เวลาที่ชาร์จที่ความดันสูง แต่โดยทั่วๆ ไปจะอยู่ราวๆ 100-150kHz โดยหากเป็น Charger Type แบบเก่า เช่น Type A จะเป็นแบบเก่าซึ่งให้ความถี่ต่ำอยู่ราวๆ 30-65kHz ซึ่ง ถามว่าใช้งานได้ไหม ใช้ได้แหละ แต่นานๆ ทีพอนะ</p>
  <p slot="ripple-pct">เช่น . . . ถ้ามี Ripple ที่ 100mV แต่ Vbus วิ่งอยู่ที่ 20V จะมี % Ripple คิดเป็น 0.5% ถือว่าปลอดภัยมาก แต่กลับกัน หากมี Ripple ที่ 100mV แต่ Vbus วิ่งที่ 5V จะมี % Ripple คิดเป็น 2% ซึ่งถือว่าไม่ค่อยดีละ . . . เพราะฉะนั้นถึงต้องดูข้อนี้คู่กันด้วยครับ</p>
</ChargerCriteria>
```
- the `#analyze` section's `<div class="gallery"></div>` → `<ShotGallery shots={shots} />`.

- [ ] **Step 8: `src/pages/reviews/[category]/[slug].astro`**

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../../layouts/Base.astro';
import { CATEGORIES } from '../../../data/site.js';

export async function getStaticPaths() {
  const all = await getCollection('reviews', (r) => !r.data.draft);
  return all.map((entry) => {
    const [category, slug] = entry.id.split('/');
    return { params: { category, slug }, props: { entry } };
  });
}
const { entry } = Astro.props;
const { Content, headings } = await render(entry);
const d = entry.data;
const toc = headings.filter((h) => h.depth === 2 && h.slug);
---
<Base title={d.title} description={d.description} image={d.cover} active="reviews" ogType="article">
  <section class="hero">
    <div class="wrap">
      <div class="hero__text">
        <nav class="crumbs" aria-label="breadcrumb"><a href="/reviews/">Reviews</a> / <a href={`/reviews/${d.category}/`}>{CATEGORIES[d.category]}</a></nav>
        <span class="kicker">{d.kicker}</span>
        <h1>{d.title}</h1>
        <p class="lead">{d.lead}</p>
        <p class="meta">{d.meta} · {d.date.toLocaleDateString('th-TH', { dateStyle: 'long' })}</p>
      </div>
      <figure class="hero__media"><img src={d.cover} width="1600" height="1200" alt={d.coverAlt} /></figure>
    </div>
  </section>
  <div class="wrap layout">
    <nav class="toc" aria-label="สารบัญ">
      <b>ในบทความนี้</b>
      <ol>{toc.map((h) => <li><a href={`#${h.slug}`}>{h.text}</a></li>)}</ol>
    </nav>
    <main class="content"><Content /></main>
  </div>
  {d.sourceUrl && <div class="wrap source">โพสต์ต้นฉบับ: <a href={d.sourceUrl} rel="noopener">Facebook · Dojo-mAn Fotographer</a> · ภาพทั้งหมด © Dojo-mAn Photographer</div>}
</Base>
```
Note: TOC is built from `##` headings. In the MDX body, the four section headings must be Markdown `## …` (not `<h2>`) so Astro sees them; their auto-slugs replace the hand-written `id`s. MDX only parses Markdown inside an HTML/JSX block when it is separated by blank lines, so keep an empty line after every opening `<section …>`/`<div …>` and before its closing tag; update the `#criteria` anchor links accordingly only if they pointed at section ids (the criteria links point at `#ripple-mv` etc., which stay).

- [ ] **Step 9: `src/pages/reviews/[category]/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../../layouts/Base.astro';
import { CATEGORIES } from '../../../data/site.js';
export function getStaticPaths() {
  return Object.keys(CATEGORIES).map((category) => ({ params: { category } }));
}
const { category } = Astro.params;
const items = (await getCollection('reviews', (r) => !r.data.draft && r.data.category === category))
  .sort((a, b) => b.data.date - a.data.date);
---
<Base title={`${CATEGORIES[category]} Reviews`} active="reviews">
  <section class="hero"><div class="wrap" style="grid-template-columns:1fr">
    <div class="hero__text"><span class="kicker">Reviews</span><h1>{CATEGORIES[category]}</h1></div>
  </div></section>
  <main class="wrap layout"><div class="content">
    {items.length === 0 && <p class="empty">ยังไม่มีรีวิวในหมวดนี้</p>}
    <div class="gallery">
      {items.map((r) => (
        <a class="shot" href={`/reviews/${r.id}/`}>
          <div class="shot__img"><img src={r.data.cover} width="1600" height="1200" loading="lazy" alt="" /></div>
          <div class="shot__body"><div class="shot__label">{r.data.title}</div><span class="meta">{r.data.description}</span></div>
        </a>
      ))}
    </div>
  </div></main>
</Base>
```

- [ ] **Step 10: `src/pages/reviews/index.astro`** — same as Step 9 but: no `getStaticPaths`; `items` = all non-draft reviews sorted by date; above the gallery a row of two category links:

```astro
<ul class="criteria">
  {Object.entries(CATEGORIES).map(([k, v]) => <li><a href={`/reviews/${k}/`}>{v}</a></li>)}
</ul>
```
Title `Reviews`, `<h1>Reviews</h1>`, each card also shows `CATEGORIES[r.data.category]` in `.meta`.

- [ ] **Step 11: Delete the old static review files**

```bash
git rm public/reviews/review.js public/reviews/charger/index.html public/reviews/charger/ripple-guide.html
```

- [ ] **Step 12: Verify** — `npm run build`; open `/reviews/`, `/reviews/charger/`, `/reviews/headphones/` (empty state), `/reviews/charger/ripple-guide/`. The review must look the same as the approved 2026-11-08 version at 1920 / 1280 / 390 (compare with the screenshots in the scratchpad), modal opens, ←/→ and Esc work. `curl -s …/reviews/charger/ripple-guide/ | grep og:title` shows the Thai title.

- [ ] **Step 13: STOP → owner confirms → commit** `feat(reviews): review collection with charger and headphone categories, migrate ripple guide`

---

### Task 4: Formal Home, Projects, About, Guestbook, 404

**Files:**
- Create/replace: `src/pages/index.astro`, `src/pages/projects.astro`, `src/pages/about.astro`, `src/pages/guestbook.astro`, `src/pages/404.astro`

**Interfaces:**
- Consumes: `Base`, `PROJECTS`, `CASE_STUDIES`, `EXPERIENCES`, `PROFILE`, `DOCS_URL`, `CommentsPage`, `getCollection('reviews')`.

- [ ] **Step 1: `src/pages/index.astro`**

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import { PROFILE, PROJECTS } from '../data/site.js';
import { CATEGORIES } from '../data/site.js';
const latest = (await getCollection('reviews', (r) => !r.data.draft))
  .sort((a, b) => b.data.date - a.data.date).slice(0, 3);
---
<Base active="home">
  <section class="hero"><div class="wrap">
    <div class="hero__text">
      <span class="kicker">{PROFILE.title}</span>
      <h1>{PROFILE.name}</h1>
      <p class="lead">{PROFILE.summary}</p>
      <p class="meta"><a href="/projects/">ดูผลงาน</a> · <a href="/reviews/">อ่านรีวิว</a> · <a href={`mailto:${PROFILE.email}`}>ติดต่อ</a></p>
    </div>
  </div></section>
  <main class="wrap layout" style="grid-template-columns:1fr">
    <section class="section">
      <h2>รีวิวล่าสุด</h2>
      <div class="gallery">
        {latest.map((r) => (
          <a class="shot" href={`/reviews/${r.id}/`}>
            <div class="shot__img"><img src={r.data.cover} width="1600" height="1200" loading="lazy" alt="" /></div>
            <div class="shot__body"><div class="shot__label">{r.data.title}</div><span class="meta">{CATEGORIES[r.data.category]}</span></div>
          </a>
        ))}
      </div>
    </section>
    <section class="section">
      <h2>Projects</h2>
      <div class="grade-grid">
        {PROJECTS.slice(0, 4).map((p) => (
          <a class="grade-card" href={p.link} style="text-decoration:none;color:inherit">
            <h3>{p.name} <small>{p.status}</small></h3>
            <p>{p.desc}</p>
          </a>
        ))}
      </div>
      <p><a href="/projects/">ดูทั้งหมด</a></p>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: `src/pages/projects.astro`** — `<Base title="Projects" active="projects">`; hero `<h1>Projects</h1>`; a `.grade-grid` of all `PROJECTS` cards (name, status as text, desc, `tech.join(' · ')` in `.meta`, link "เอกสาร" → `p.link`); then `## Case studies` with one `.grade-card` per `CASE_STUDIES` item showing `tag`, `title`, and three labelled paragraphs `ปัญหา` / `วิธีแก้` / `ผลลัพธ์` from `problem` / `solution` / `result`, and `stack.join(' · ')`. Do not render `emoji`/`icon`/`color` fields (no emoji as UI).

- [ ] **Step 3: `src/pages/about.astro`** — `<Base title="About" active="about">`; hero with `PROFILE.name`, `PROFILE.title`; an ordered timeline: for each `EXPERIENCES` item a `.grade-card` with `<h3>{role} <small>{period}</small></h3>` and `<ul>{items}</ul>`; socials list from `PROFILE.socials` as plain links.

- [ ] **Step 4: `src/pages/guestbook.astro`**

```astro
---
import Base from '../layouts/Base.astro';
import { CommentsPage } from '../App.jsx';
---
<Base title="Guestbook" active="guestbook">
  <main class="wrap layout" style="grid-template-columns:1fr">
    <div style="background:#030b14;color:#fff;border-radius:var(--radius-lg);overflow:hidden;font-family:var(--font-mono)">
      <CommentsPage client:only="react" />
    </div>
  </main>
</Base>
```

- [ ] **Step 5: `src/pages/404.astro`** — `<Base title="ไม่พบหน้า">` + `<main class="wrap layout"><h1>404</h1><p>ไม่พบหน้านี้ <a href="/">กลับหน้าแรก</a></p></main>`.

- [ ] **Step 6: Verify** — build; each page at 390 and 1280: readable, no horizontal scroll; guestbook loads comments from Firestore and posting needs Google sign-in as before; visitor counter: open `/` then `/lab/` and confirm the count went up by 2 (D5). Sign-in and posting must be tested on `http://localhost:4173` (SSH tunnel `ssh -L 4173:localhost:4173`), because Firebase Auth rejects the Tailscale IP and `*.pages.dev` with `auth/unauthorized-domain` unless those domains are added in Firebase Console → Authentication → Settings → Authorized domains. Lint passes.

- [ ] **Step 7: STOP → owner confirms → commit** `feat(site): formal home, projects, about, guestbook pages`

---

### Task 5: Smoke check, cleanup, docs

**Files:**
- Create: `scripts/smoke.mjs`
- Delete: `public/sitemap.xml`
- Modify: `public/robots.txt` (sitemap line → `/sitemap-index.xml`), `CLAUDE.md`, `DEPLOYMENT.md`

- [ ] **Step 1: `scripts/smoke.mjs`** — Playwright is NOT added to `package.json` (it would download browsers during the Pages `npm ci`). Run it with the copy already installed in the session scratchpad: `NODE_PATH=<scratchpad>/pw/node_modules PLAYWRIGHT_BROWSERS_PATH=<scratchpad>/pw/browsers node scripts/smoke.mjs`; the `smoke` npm script is dropped from Task 1 Step 4.

```js
// Usage: npm run build && (npx astro preview --port 4173 &) && npm run smoke
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:4173';
const ROUTES = ['/', '/projects/', '/about/', '/guestbook/', '/reviews/', '/reviews/charger/', '/reviews/headphones/', '/reviews/charger/ripple-guide/', '/lab/'];
const fails = [];
const browser = await chromium.launch();
for (const width of [390, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on('pageerror', (e) => fails.push(`${width} ${page.url()} pageerror: ${e.message}`));
  for (const r of ROUTES) {
    const res = await page.goto(BASE + r, { waitUntil: 'networkidle' });
    if (res.status() !== 200) fails.push(`${width} ${r} status ${res.status()}`);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (sw > 0 && r !== '/lab/') fails.push(`${width} ${r} horizontal overflow ${sw}px`);
    if (r !== '/lab/' && !(await page.$('meta[property="og:title"]'))) fails.push(`${r} missing og:title`);
  }
  await page.goto(BASE + '/reviews/charger/ripple-guide/', { waitUntil: 'networkidle' });
  await page.locator('.shot').first().click();
  if (!(await page.$eval('dialog.viewer', (d) => d.open))) fails.push(`${width} viewer did not open`);
  await page.keyboard.press('ArrowRight');
  if ((await page.textContent('#viewer-title')) !== 'รูป B') fails.push(`${width} ArrowRight did not advance`);
  await page.keyboard.press('Escape');
  if (await page.$eval('dialog.viewer', (d) => d.open)) fails.push(`${width} Escape did not close`);
  await page.close();
}
await browser.close();
const missing = await fetch(BASE + '/no-such-page/');
if (missing.status !== 404) fails.push(`unknown route returned ${missing.status}, expected 404`);
console.log(fails.length ? `FAIL\n${fails.join('\n')}` : `PASS ${ROUTES.length} routes × 2 widths`);
process.exit(fails.length ? 1 : 0);
```

- [ ] **Step 2: Prove it can fail** — temporarily rename `ripple-guide.mdx` → `_ripple-guide.mdx.bak`, run `npm run build && npm run smoke`, expect `FAIL … /reviews/charger/ripple-guide/ status 404`. Rename back, rebuild, expect `PASS`.

- [ ] **Step 3: Cleanup**

```bash
git rm public/sitemap.xml
sed -i 's#^Sitemap:.*#Sitemap: https://dojojin.tech/sitemap-index.xml#' public/robots.txt
```
Check `src/App.css` is unused (`grep -rn "App.css" src` → nothing) and `git rm` it if so.

- [ ] **Step 4: Docs** — `CLAUDE.md`: tech stack line → Astro 7.3.8 + React islands; file table → the File Structure table above; add "เพิ่มรีวิวใหม่ = สร้าง `src/content/reviews/<category>/<slug>.mdx` + `<slug>.shots.json` + รูปใน `public/reviews/<category>/img/` (ย่อ ≤1600px และลบ EXIF/GPS ก่อน)"; remove the "no client-side router / SPA หน้าเดียว" notes; local Tailscale preview = `PUBLIC_DOCS_URL=http://100.89.1.29:4174 npm run build && npx astro preview --host 0.0.0.0 --port 4173`. `DEPLOYMENT.md`: build command/output unchanged; `NODE_VERSION` on Pages must be ≥ 22.12.0.

- [ ] **Step 5: Full verify** — `npm run lint && npm run build && npm run smoke` → `PASS`. Preview over Tailscale for the owner.

- [ ] **Step 6: STOP → owner confirms → commit** `chore(site): smoke check, sitemap integration, docs for the Astro layout`

- [ ] **Step 7: Preview deploy (owner says when)** — `git push -u origin astro-rebuild` → Cloudflare Pages builds a preview URL. Pages has separate Preview and Production env vars: set `VITE_OWNER_EMAILS` in **Preview** too, or the delete button will not show on the branch preview. Merge to `main` only on the owner's word.
