import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://dojojin.tech',
  integrations: [react(), mdx(), sitemap()],
  server: { host: true },
  vite: {
    envPrefix: ['PUBLIC_', 'VITE_'], // keep VITE_OWNER_EMAILS working on Cloudflare Pages
    server: { allowedHosts: ['.trycloudflare.com', '.ts.net'] },
  },
});
