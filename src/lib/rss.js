// RSS feeds (/rss.xml = everything, /news/rss.xml = news only): newest 50 items, cover as <enclosure>.
import rss from '@astrojs/rss';
import { getFeed } from './feed.js';
import { TYPES } from '../data/site.js';

export async function feed(site, type) {
  const items = (await getFeed(type)).slice(0, 50);
  return rss({
    title: type ? `DOJOJIN.TECH · ${TYPES[type].name}` : 'DOJOJIN.TECH',
    description: type ? TYPES[type].blurb : 'รีวิว ความรู้ ข่าวเทคโนโลยี และที่เที่ยว จาก Dojo-mAn',
    site,
    customData: '<language>th</language>',
    items: items.map((i) => ({
      title: i.title, link: i.href, pubDate: i.date, description: i.sub,
      customData: i.cover ? `<enclosure url="${new URL(i.cover, site).href}" length="0" type="${i.cover.endsWith('.png') ? 'image/png' : 'image/jpeg'}"/>` : '',
    })),
  });
}
