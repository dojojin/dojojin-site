// Price Atlas pages, served at /data/<slug>/ (type data, category smartphone). Shared by scripts/patch-atlas.mjs (head metadata, strip)
// and the topic pages / home feed (src/lib/feed.js). Stats are counted from each atlas's own data
// (window.__ATLAS__) — update them when a new atlas version is dropped in.
export const ATLASES = [
  {
    topic: 'smartphone', type: 'data', tags: ['apple', 'price'],
    slug: 'iphone-price-atlas',
    short: 'iPhone Price Atlas',
    title: 'iPhone Thai Price Atlas — ราคาเปิดตัวในไทยทุกรุ่น',
    description: 'ราคาเปิดตัว iPhone ในไทยทุกรุ่น 2007–2026 ทุกความจุ เทียบราคาสหรัฐฯ พร้อมสเปกระดับชิ้นส่วนจากการแกะเครื่อง',
    brand: 'Apple',
    models: 55, years: '2007–2026', photos: 55,
    thbMin: 14900, thbMax: 127900,
    updated: '2026-10-21',
  },
  {
    topic: 'smartphone', type: 'data', tags: ['samsung', 'price'],
    slug: 'galaxy-s-price-atlas',
    short: 'Galaxy S Price Atlas',
    title: 'Galaxy S Thai Price Atlas — ราคาเปิดตัวในไทยทุกรุ่น',
    description: 'ราคาเปิดตัว Samsung Galaxy S ในไทยทุกรุ่น 2010–2026 พร้อมสเปกและชิ้นส่วนบนบอร์ดของรุ่นที่ขายในไทย',
    brand: 'Samsung',
    models: 46, years: '2010–2026', photos: 45,
    thbMin: 18900, thbMax: 66900,
    updated: '2026-10-01',
  },
  {
    topic: 'smartphone', type: 'data', tags: ['vivo', 'price'],
    slug: 'vivo-x-price-atlas',
    short: 'vivo X Price Atlas',
    title: 'vivo X Thai Price Atlas — ราคาเปิดตัวในไทยทุกรุ่น',
    description: 'ราคาเปิดตัว vivo X ในไทย คู่กับราคาเปิดตัวในจีน ทุกรุ่น 2012–2026 พร้อมสเปกและชิ้นส่วนบนบอร์ด',
    brand: 'vivo',
    models: 63, years: '2012–2026', photos: 9,
    thbMin: 12990, thbMax: 79999,
    updated: '2026-10-01',
  },
];
