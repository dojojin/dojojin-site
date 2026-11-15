// Visit breakdown for /stats/: user agent → app / browser / os / device, referrer → ref.
// Regex only, first match wins (order matters). Values are short keys; /stats/ shows LABELS.
// KEEP IN SYNC: every key here must also be listed in the uadaily doc-id regex in firestore.rules,
// or that write is rejected (silently, by design).

export const BOT = /bot\b|bot\/|crawler|spider|preview|facebookexternalhit|facebookcatalog|slurp|curl\/|wget\/|python-requests|python-urllib|go-http-client|node-fetch|axios\/|headlesschrome|okhttp\/|java\//i;

// In-app browsers. Messenger before Facebook (it also carries FBAN).
const APPS = [
  ['line', /\bLine\/\d/i], ['messenger', /FB_IAB\/MESSENGER|FBAN\/Messenger|MessengerForiOS|Orca-Android/i],
  ['facebook', /FBAN|FBAV|FB_IAB|FB4A/i], ['instagram', /Instagram/i], ['tiktok', /musical_ly|TikTok|BytedanceWebview/i],
  ['telegram', /Telegram/i], ['whatsapp', /WhatsApp/i], ['wechat', /MicroMessenger/i], ['outlook', /Outlook|ms-office/i],
  ['teams', /Teams\//i], ['slack', /Slack/i],
];
// Edge / Samsung / Opera before Chrome (all carry "Chrome/").
const BROWSERS = [
  ['edge', /Edg(A|iOS)?\//], ['samsung', /SamsungBrowser\//], ['opera', /OPR\/|Opera/], ['firefox', /Firefox\/|FxiOS\//],
  ['chrome', /Chrome\/|CriOS\//], ['safari', /Version\/[\d.]+.*Safari\//],
];
// Android before Linux.
const OSES = [['ios', /iPhone|iPad|iPod/], ['android', /Android/], ['windows', /Windows NT/], ['macos', /Mac OS X|Macintosh/], ['chromeos', /CrOS/], ['linux', /Linux/]];

const first = (list, s) => list.find(([, re]) => re.test(s))?.[0];

// touch = navigator.maxTouchPoints: iPadOS Safari sends a desktop Mac UA, a touch screen gives it away.
export function classify(ua = '', touch = 0) {
  if (!ua || BOT.test(ua)) return { bot: true };
  const ipad = /Macintosh/.test(ua) && touch > 1;
  const app = first(APPS, ua) ?? 'none';
  const browser = app === 'none' ? first(BROWSERS, ua) ?? 'other' : 'inapp';
  const os = ipad ? 'ios' : first(OSES, ua) ?? 'other';
  const device = ipad || /iPad|Tablet/i.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) ? 'tablet'
    : /Mobi|iPhone|iPod|Android/i.test(ua) ? 'mobile' : os !== 'other' ? 'desktop' : 'other';
  return { bot: false, app, browser, os, device };
}

const REFS = [
  ['facebook', /(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/], ['google', /(^|\.)google\.[a-z.]+$/],
  ['line', /(^|\.)line\.me$/], ['bing', /(^|\.)bing\.com$/], ['x', /(^|\.)(t\.co|x\.com|twitter\.com)$/],
  ['youtube', /(^|\.)youtube\.com$/], ['pantip', /(^|\.)pantip\.com$/], ['internal', /(^|\.)dojojin\.tech$/],
];
export function refOf(referrer = '') {
  if (!referrer) return 'direct';
  try { return first(REFS, new URL(referrer).hostname) ?? 'other'; } catch { return 'other'; }
}

export const LABELS = {
  app: { none: 'เบราว์เซอร์ปกติ', line: 'LINE', messenger: 'Messenger', facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok', telegram: 'Telegram', whatsapp: 'WhatsApp', wechat: 'WeChat', outlook: 'Outlook', teams: 'Microsoft Teams', slack: 'Slack' },
  browser: { edge: 'Edge', samsung: 'Samsung Internet', opera: 'Opera', firefox: 'Firefox', chrome: 'Chrome', safari: 'Safari', inapp: 'เปิดในแอป', other: 'ไม่ทราบ' },
  os: { ios: 'iOS / iPadOS', android: 'Android', windows: 'Windows', macos: 'macOS', chromeos: 'ChromeOS', linux: 'Linux', other: 'ไม่ทราบ' },
  device: { mobile: 'มือถือ', tablet: 'แท็บเล็ต', desktop: 'คอมพิวเตอร์', other: 'ไม่ทราบ' },
  ref: { direct: 'เข้าตรง / ไม่ทราบ', facebook: 'Facebook', google: 'Google', line: 'LINE', bing: 'Bing', x: 'X (Twitter)', youtube: 'YouTube', pantip: 'Pantip', internal: 'ภายในเว็บ', other: 'เว็บอื่น' },
};
