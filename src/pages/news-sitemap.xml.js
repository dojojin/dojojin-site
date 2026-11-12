// Google News sitemap: news posts from the last 2 days (Google only reads those), newest first.
import { getCollection } from 'astro:content';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export async function GET({ site }) {
  const since = Date.now() - 2 * 24 * 3600 * 1000;
  const posts = (await getCollection('posts', (p) => p.data.type === 'news' && !p.data.draft))
    .filter((p) => +p.data.date >= since).sort((a, b) => b.data.date - a.data.date);
  const urls = posts.map((p) => `<url><loc>${new URL(`/${p.id}/`, site).href}</loc><news:news><news:publication><news:name>DOJOJIN.TECH</news:name><news:language>th</news:language></news:publication><news:publication_date>${p.data.date.toISOString()}</news:publication_date><news:title>${esc(p.data.title)}</news:title></news:news></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
