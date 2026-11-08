import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dojojin.tech',
  // Tag pages are thin (some noindex) and /lab is noindex, so they stay out of the sitemap; crawlers still reach them via links.
  integrations: [react(), mdx(), sitemap({ filter: (page) => !/^\/(tag\/[^/]+|lab)\/$/.test(new URL(page).pathname) })],
  server: { host: true },
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'], // keep VITE_OWNER_EMAILS working on Cloudflare Pages
    server: { allowedHosts: ['.trycloudflare.com', '.ts.net'] },
  },
});
