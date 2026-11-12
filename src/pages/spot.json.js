// Home spotlight + "ยอดนิยม" titles, fetched after page load (kept out of the home HTML: ~60 KB less to parse before first paint).
import { getFeed } from '../lib/feed.js';
import { TYPES } from '../data/site.js';

export async function GET() {
  const feed = await getFeed();
  return new Response(JSON.stringify({
    spot: feed.map((i) => ({ href: i.href, title: i.title, cover: i.cover, kind: TYPES[i.type]?.name ?? '', sub: i.sub ?? '' })),
    titles: Object.fromEntries(feed.map((i) => [i.href, i.title])),
  }), { headers: { 'Content-Type': 'application/json' } });
}
