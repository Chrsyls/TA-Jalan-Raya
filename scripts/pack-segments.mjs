// Usage: node scripts/pack-segments.mjs   (after prepare-its.mjs)
// Packs public/data/segments.geojson into a compact, lossless-at-6-decimals format for the browser:
// segments.min.json (+ .gz). Ids are derived from the array index; coordinates are delta-encoded integers (1e-6 deg).
import fs from 'node:fs'; import zlib from 'node:zlib';
const fc = JSON.parse(fs.readFileSync('public/data/segments.geojson', 'utf8')), hw = [], nm = [''];
const ix = (a, v) => { let i = a.indexOf(v); if (i < 0) { a.push(v); i = a.length - 1; } return i; };
const s = fc.features.map(f => {
  const p = f.properties, row = [ix(hw, p.hw), ix(nm, p.name || ''), Math.round(p.len * 10), p.lanes, p.ow, p.from, p.to, Math.round(p.iri * 10)];
  let x = 0, y = 0; for (const [lo, la] of f.geometry.coordinates) { const X = Math.round(lo * 1e6), Y = Math.round(la * 1e6); row.push(X - x, Y - y); x = X; y = Y; }
  return row;
});
const out = JSON.stringify({ v: 1, q: 1e6, hw, nm, s });
fs.writeFileSync('public/data/segments.min.json', out); fs.writeFileSync('public/data/segments.min.json.gz', zlib.gzipSync(out, { level: 9 }));
console.log(`segments.min.json ${out.length} bytes, gz ${fs.statSync('public/data/segments.min.json.gz').size} bytes`);
