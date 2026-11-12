import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// lastmod per post URL from its frontmatter `date` (and `updated` if present), so Google sees what is new.
const lastmod = {};
for (const type of readdirSync('src/content/posts')) {
  for (const f of readdirSync(`src/content/posts/${type}`).filter((n) => n.endsWith('.mdx'))) {
    const fm = readFileSync(`src/content/posts/${type}/${f}`, 'utf8').split('---')[1] ?? '';
    const d = (fm.match(/^updated:\s*"?([^"\n#]+)/m) || fm.match(/^date:\s*"?([^"\n#]+)/m))?.[1]?.trim();
    if (d && !isNaN(new Date(d))) lastmod[`https://dojojin.tech/${type}/${f.slice(0, -4)}/`] = new Date(d).toISOString();
  }
}

export default defineConfig({
  site: 'https://dojojin.tech',
  // CSS inlined into each page: no render-blocking stylesheet request before first paint on slow phones (PageSpeed).
  build: { inlineStylesheets: 'always' },
  // Tag pages are thin (some noindex) and /lab is noindex, so they stay out of the sitemap; crawlers still reach them via links.
  integrations: [react(), mdx(), sitemap({
    filter: (page) => !/^\/(tag\/[^/]+|lab|search)\/$/.test(new URL(page).pathname),
    serialize: (item) => (lastmod[item.url] ? { ...item, lastmod: lastmod[item.url] } : item),
  })],
  server: { host: true },
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'], // keep VITE_OWNER_EMAILS working on Cloudflare Pages
    server: { allowedHosts: ['.trycloudflare.com', '.ts.net'] },
  },
});
