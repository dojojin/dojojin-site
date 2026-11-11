import { feed } from '../../lib/rss.js';
export const GET = (ctx) => feed(ctx.site, 'news');
