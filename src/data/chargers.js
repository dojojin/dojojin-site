// Chargers & USB power gear reviewed on the site — values copied from each review's spec table / measurements.
// measured = highest live reading in the review (POWER-Z); null = not measured in the review.
export const CHARGERS = [
  { slug: 'slimq-f100', name: 'SlimQ F100', kind: 'หัวชาร์จ GaN', max: 100, ports: 'C×2 · A×2', pd: 'PD 3.0 · PPS 3.3–21V 3A', extra: 'SCP 40W · QC · AFC · VFCP', measured: '91.9W (MacBook)', weight: 205 },
  { slug: 'orsen-c102t', name: 'ORSEN C102T', kind: 'หัวชาร์จ GaN', max: 100, ports: 'C×2 · A×1', pd: 'PD 3.0 · PPS 3.3–11V 5A', extra: 'SCP 40W · QC4+ · AFC', measured: null, weight: 165 },
  { slug: 'vivo-x100-pro-charger', name: 'vivo FlashCharge 120W', kind: 'หัวชาร์จแถมมือถือ', max: 120, ports: 'C×1', pd: 'PD 3.0 100W · PPS 5–20V 5A', extra: 'VFCP 120W · UFCS 33W', measured: '82.1W', weight: null },
  { slug: 'apple-96w-macbook-pro', name: 'Apple 96W', kind: 'หัวชาร์จแถม MacBook', max: 96, ports: 'C×1', pd: 'PD 2.0 (ไม่มี PPS)', extra: '–', measured: '94W (โปรโตคอล)', weight: null },
  { slug: 'commy-ad003pq', name: 'COMMY AD003PQ', kind: 'หัวชาร์จ', max: 33, ports: 'C×1 · A×1', pd: 'PD 3.0 · PPS 3.3–11V 3A', extra: 'QC 4.0', measured: '29.1W', weight: null, price: 429 },
  { slug: 'hoco-q47', name: 'HOCO Q47', kind: 'พาวเวอร์แบงก์', max: 20, ports: 'C (PD 20W)', pd: 'PD 3.0 20W · PPS', extra: 'QC 3.0 · FCP · SCP · AFC', measured: null, weight: 210 },
  { slug: 'anitech-h9313', name: 'anitech H9313', kind: 'ปลั๊กพ่วง + USB', max: 17, ports: 'C×2 · A×1 (+ เต้ารับ)', pd: 'ไม่มี PD (DCP เท่านั้น)', extra: '–', measured: '7.08W', weight: null, price: 269 },
];
