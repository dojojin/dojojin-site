// Self-check for src/lib/ua.js and its firestore.rules allowlist: node scripts/ua-check.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { classify, refOf, LABELS } from '../src/lib/ua.js';

const C = (ua, touch) => { const r = classify(ua, touch); return r.bot ? 'bot' : `${r.app}/${r.browser}/${r.os}/${r.device}`; };
const cases = [
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22B83 [FBAN/FBIOS;FBAV/490.0.0.38.107;FBBV/1;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/18.1;FBSS/3;FBID/phone;FBLC/th_TH;FBOP/5]', 'facebook/inapp/ios/mobile'],
  ['Mozilla/5.0 (Linux; Android 14; SM-S928B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.102 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/489.0.0.66.81;]', 'facebook/inapp/android/mobile'],
  ['Mozilla/5.0 (Linux; Android 14; Pixel 8; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0 Mobile Safari/537.36 [FB_IAB/MESSENGER;FBAV/480.0.0.47.109;]', 'messenger/inapp/android/mobile'],
  ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari Line/14.12.0', 'line/inapp/ios/mobile'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', 'none/safari/macos/desktop'],
  ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15', 'none/safari/ios/tablet', 5],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', 'none/edge/windows/desktop'],
  ['Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36', 'none/samsung/android/mobile'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 OPR/115.0.0.0', 'none/opera/windows/desktop'],
  ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'none/chrome/windows/desktop'],
  ['Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36', 'none/chrome/android/tablet'],
  ['Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0', 'none/firefox/linux/desktop'],
  ['Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36', 'bot'],
  ['facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'bot'],
  ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'bot'],
  ['', 'bot'],
];
for (const [ua, want, touch] of cases) assert.equal(C(ua, touch), want, ua.slice(0, 60));

assert.equal(refOf(''), 'direct');
assert.equal(refOf('https://l.facebook.com/l.php?u=x'), 'facebook');
assert.equal(refOf('https://m.facebook.com/'), 'facebook');
assert.equal(refOf('https://www.google.co.th/'), 'google');
assert.equal(refOf('https://dojojin.tech/review/'), 'internal');
assert.equal(refOf('https://example.com/'), 'other');
assert.equal(refOf('not a url'), 'other');

// Every key the classifier can produce must be allowed by firestore.rules (else the write is rejected).
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
for (const [dim, keys] of Object.entries(LABELS)) {
  const m = rules.match(new RegExp(`${dim}__\\(([a-z|]+)\\)`));
  assert.ok(m, `firestore.rules has no allowlist for ${dim}`);
  assert.deepEqual(m[1].split('|').sort(), Object.keys(keys).sort(), `allowlist mismatch for ${dim}`);
}
console.log(`ua-check: ${cases.length} UA cases, 7 referrers, rules allowlist OK`);
