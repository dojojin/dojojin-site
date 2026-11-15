// Daily snapshot of every page's cumulative view count → snapshots/{yyyymmdd} (read by /stats/ for daily trends).
// Run by .github/workflows/stats-snapshot.yml just after midnight Bangkok time; the doc is named after the Bangkok
// day that just ended (takenAt − 12 h), and takenAt is stored so a late or missed run shows as a gap, not a wrong number.
// Needs FIREBASE_SA = a service-account JSON key (Cloud Datastore User role). The key and token are never printed.
import { createSign } from 'node:crypto';

const sa = JSON.parse(process.env.FIREBASE_SA ?? 'null');
if (!sa?.client_email || !sa?.private_key) { console.error('FIREBASE_SA is missing or not a service-account key'); process.exit(1); }
const projectId = process.env.FIREBASE_PROJECT ?? sa.project_id;

// OAuth access token from a self-signed JWT (no SDK needed).
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/datastore', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 600 })}`;
const jwt = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url')}`;
const tok = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) }).then((r) => r.json());
if (!tok.access_token) { console.error('token exchange failed:', tok.error ?? 'unknown'); process.exit(1); }
const auth = { Authorization: `Bearer ${tok.access_token}`, 'Content-Type': 'application/json' };

const api = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const call = async (url, init) => { const r = await fetch(url, { headers: auth, ...init }); if (!r.ok) throw new Error(`${r.status} ${url.replace(api, '')}: ${(await r.text()).slice(0, 200)}`); return r.json(); };

const rows = await call(`${api}:runQuery`, { method: 'POST', body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'pageviews' }] } }) });
const views = Object.fromEntries(rows.filter((r) => r.document).map((r) => [r.document.name.split('/').pop(), { integerValue: r.document.fields?.count?.integerValue ?? '0' }]));
const visitors = (await call(`${api}/meta/visitors`)).fields?.count?.integerValue ?? '0';

const takenAt = new Date();
const day = new Date(takenAt.getTime() + 7 * 3600e3 - 12 * 3600e3).toISOString().slice(0, 10).replace(/-/g, '');
await call(`${api}/snapshots/${day}`, { method: 'PATCH', body: JSON.stringify({ fields: {
  takenAt: { timestampValue: takenAt.toISOString() }, visitors: { integerValue: visitors }, views: { mapValue: { fields: views } },
} }) });
console.log(`snapshots/${day}: ${Object.keys(views).length} pages, visitors ${visitors}, taken ${takenAt.toISOString()}`);
