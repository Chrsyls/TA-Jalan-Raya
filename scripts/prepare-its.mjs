// Usage: node scripts/prepare-its.mjs [storage/app/rute_its.geojson]
// OSM ways -> drivable network cut at junctions and every <= SEG_M metres, plus a signed-sensor registry.
import fs from 'node:fs'; import crypto from 'node:crypto';
const SRC = process.argv[2] ?? 'storage/app/rute_its.geojson', SEG_M = 200, EVERY = 3, MAX_SENSORS = 80;
const SPEED = { primary: 40, primary_link: 30, secondary: 35, secondary_link: 28, tertiary: 30, tertiary_link: 25, unclassified: 25, residential: 20, living_street: 12 };
const MAIN = new Set(['primary', 'secondary', 'tertiary']);
const fc = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const dist = (a, b) => Math.hypot((a[0] - b[0]) * 111320 * Math.cos((a[1] + b[1]) * Math.PI / 360), (a[1] - b[1]) * 110574);
const key = p => p[0].toFixed(6) + ',' + p[1].toFixed(6);
const ways = fc.features.filter(f => SPEED[f.properties.highway]).map(f => ({ p: f.properties, c: f.geometry.coordinates[0] }));
const uses = new Map(); ways.forEach(w => w.c.forEach(p => uses.set(key(p), (uses.get(key(p)) ?? 0) + 1)));
const nodeId = new Map(), nid = p => nodeId.get(key(p)) ?? (nodeId.set(key(p), nodeId.size), nodeId.size - 1);
const hash = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };
const r6 = q => q.map(v => +v.toFixed(6)), feats = [];
for (const w of ways) {
  const pieces = []; let cur = [w.c[0]];                       // 1) cut at junction vertices
  for (let i = 1; i < w.c.length; i++) { cur.push(w.c[i]); if (i < w.c.length - 1 && uses.get(key(w.c[i])) > 1) { pieces.push(cur); cur = [w.c[i]]; } }
  pieces.push(cur);
  for (const pc of pieces) {                                    // 2) cut by length
    const cum = [0]; for (let i = 1; i < pc.length; i++) cum.push(cum[i - 1] + dist(pc[i - 1], pc[i]));
    const L = cum.at(-1); if (L < 1) continue; const n = Math.max(1, Math.round(L / SEG_M));
    const at = d => { let k = 1; while (k < cum.length - 1 && cum[k] < d) k++; const t = (d - cum[k - 1]) / ((cum[k] - cum[k - 1]) || 1); return [pc[k - 1][0] + (pc[k][0] - pc[k - 1][0]) * t, pc[k - 1][1] + (pc[k][1] - pc[k - 1][1]) * t]; };
    const cuts = []; for (let s = 1; s < n; s++) cuts.push(r6(at(L * s / n)));
    for (let s = 0; s < n; s++) {
      const d0 = L * s / n, d1 = L * (s + 1) / n, c = [s ? cuts[s - 1] : r6(pc[0])];
      cum.forEach((x, i) => { if (x > d0 + .01 && x < d1 - .01) c.push(r6(pc[i])); }); c.push(s === n - 1 ? r6(pc.at(-1)) : cuts[s]);
      const id = 'S-' + String(feats.length + 1).padStart(4, '0'), h = hash(id), p = w.p;
      feats.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: c }, properties: {
        id, idx: feats.length, way: p.osm_id, name: p.name ?? '', hw: p.highway, len: +(d1 - d0).toFixed(1), lanes: +p.lanes || (MAIN.has(p.highway) ? 2 : 1),
        ow: (p.oneway === 'yes' || p.junction === 'roundabout') ? 1 : 0, from: nid(c[0]), to: nid(c.at(-1)), sp: SPEED[p.highway],
        iri: +(h > .96 ? 7 + 2 * hash(id + 'b') : 2.5 + 3.5 * h).toFixed(1) } });
    }
  }
}
fs.writeFileSync('public/data/segments.geojson', JSON.stringify({ type: 'FeatureCollection', name: 'its_segments', features: feats }));
const cand = feats.filter(f => MAIN.has(f.properties.hw)).filter((f, i) => i % EVERY === 0), step = Math.max(1, Math.ceil(cand.length / MAX_SENSORS));
const reg = [], keys = {};
cand.filter((_, i) => i % step === 0).forEach((f, i) => {
  const c = f.geometry.coordinates, m = c[Math.floor(c.length / 2)], sid = 'N-' + String(i + 1).padStart(3, '0');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');
  const pub = publicKey.export({ format: 'der', type: 'spki' }).subarray(-32), seed = privateKey.export({ format: 'der', type: 'pkcs8' }).subarray(-32);
  reg.push({ i, sid, seg: f.properties.id, seg_idx: f.properties.idx, lon: m[0], lat: m[1], pub: pub.toString('hex') });
  keys[sid] = Buffer.concat([seed, pub]).toString('hex');       // libsodium secret key = seed + public
});
fs.writeFileSync('storage/app/twin/sensors.json', JSON.stringify(reg)); fs.writeFileSync('storage/app/twin/keys.json', JSON.stringify(keys));
const km = feats.reduce((a, f) => a + f.properties.len, 0) / 1000;
console.log(`${feats.length} segments, ${km.toFixed(1)} km, ${nodeId.size} nodes, ${reg.length} sensors`);
