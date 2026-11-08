// Everything readable on the site as one list: MDX posts + Price Atlas pages, newest first.
// Item shape: { href, title, topic, type, date, cover, coverW, coverH, sub }
import { getCollection } from 'astro:content';
import { ATLASES } from '../data/atlases.js';

export async function getFeed(type) {
  const posts = (await getCollection('posts', (p) => !p.data.draft)).map((p) => ({
    href: `/${p.id}/`, title: p.data.title, topic: p.data.topic, type: p.data.type, date: p.data.date,
    cover: p.data.cover, coverW: 1600, coverH: 1200, sub: p.data.description,
  }));
  const atlases = ATLASES.map((a) => ({
    href: `/${a.type}/${a.slug}/`, title: a.short, topic: a.topic, type: a.type, date: new Date(a.updated),
    cover: `/${a.type}/${a.slug}/og.png`, coverW: 1200, coverH: 630,
    sub: `${a.models} รุ่น · ${a.years} · ราคาไทย ฿${a.thbMin.toLocaleString('en-US')}–฿${a.thbMax.toLocaleString('en-US')}`,
  }));
  return [...posts, ...atlases].filter((i) => !type || i.type === type).sort((a, b) => b.date - a.date);
}
