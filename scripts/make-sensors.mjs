// Usage: node scripts/make-sensors.mjs   (needs public/data/segments.geojson from prepare-its.mjs)
// Places sensors on main roads with a minimum spacing, so they never clump, and gives each a sensing radius (m).
// Sensors cover non-overlapping discs: SPACING (320 m) is larger than twice the largest radius (2 x 120 m).
import fs from 'node:fs'; import crypto from 'node:crypto';
const SPACING = 320, MAX = 80, RADIUS = { primary: 120, secondary: 100, tertiary: 80 }, PRIORITY = { primary: 0, secondary: 1, tertiary: 2 };
const fc = JSON.parse(fs.readFileSync('public/data/segments.geojson', 'utf8'));
const dist = (a, b) => Math.hypot((a[0] - b[0]) * 111320 * .9919, (a[1] - b[1]) * 110574);
const mid = c => { let L = 0; for (let i = 1; i < c.length; i++) L += dist(c[i - 1], c[i]); let d = L / 2; for (let i = 1; i < c.length; i++) { const l = dist(c[i - 1], c[i]); if (d <= l) { const t = d / (l || 1); return [c[i - 1][0] + (c[i][0] - c[i - 1][0]) * t, c[i - 1][1] + (c[i][1] - c[i - 1][1]) * t]; } d -= l; } return c[0]; };
const cands = fc.features.filter(f => RADIUS[f.properties.hw] && f.properties.len >= 60).map(f => ({ f, m: mid(f.geometry.coordinates) }))
  .sort((a, b) => PRIORITY[a.f.properties.hw] - PRIORITY[b.f.properties.hw] || b.f.properties.len - a.f.properties.len);
const picked = []; for (const c of cands) { if (picked.length >= MAX) break; if (picked.every(p => dist(p.m, c.m) >= SPACING)) picked.push(c); }
picked.sort((a, b) => a.f.properties.idx - b.f.properties.idx);
const reg = [], keys = {};
picked.forEach((c, i) => {
  const sid = 'N-' + String(i + 1).padStart(3, '0'), { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const pub = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32), seed = privateKey.export({ format: 'der', type: 'pkcs8' }).subarray(-32);
  reg.push({ i, sid, seg: c.f.properties.id, seg_idx: c.f.properties.idx, lon: +c.m[0].toFixed(6), lat: +c.m[1].toFixed(6), r: RADIUS[c.f.properties.hw], pub: pub.toString('hex') });
  keys[sid] = Buffer.concat([seed, pub]).toString('hex');   // libsodium secret key = seed + public
});
fs.mkdirSync('storage/app/twin', { recursive: true });
fs.writeFileSync('storage/app/twin/sensors.json', JSON.stringify(reg)); fs.writeFileSync('storage/app/twin/keys.json', JSON.stringify(keys));
const nn = reg.map(a => Math.min(...reg.filter(b => b !== a).map(b => dist([a.lon, a.lat], [b.lon, b.lat])))).sort((x, y) => x - y);
console.log(`${reg.length} sensors, nearest neighbour: min ${nn[0].toFixed(0)} m, median ${nn[nn.length >> 1].toFixed(0)} m; radii ${[...new Set(reg.map(r => r.r))].join('/')} m`);
