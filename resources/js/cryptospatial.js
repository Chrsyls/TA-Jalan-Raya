// Browser version of app/Twin/CryptoSpatial.php for the local simulation: every sensor message is signed (ECDSA P-256, WebCrypto)
// and verified with the same checks and codes as the PHP ingest. Keys are generated in the page, so this is a demonstration of the
// pipeline; with Reverb the real keys and checks run on the server.
export const CODES = ['verified', 'unregistered identity', 'bad signature', 'replayed message', 'off registered location', 'wrong segment'];
export const ATTACKS = { P1: 'Edited after signing', P2: 'Cloned sensor, wrong place', P3: 'Unregistered identity', P4: 'Replayed message', P5: 'Wrong segment id', P6: 'Stolen key (known limit)' };
const ALG = { name: 'ECDSA', hash: 'SHA-256' }, enc = new TextEncoder();
const canon = m => [m.sid, m.seg, m.seq, m.lon.toFixed(6), m.lat.toFixed(6), m.v.toFixed(3), m.vol, m.spd].join('|');
const meters = (lon1, lat1, lon2, lat2) => Math.hypot((lon1 - lon2) * 111320 * Math.cos((lat1 + lat2) * Math.PI / 360), (lat1 - lat2) * 110574);
const gauss = () => Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());

export class LocalCrypto {
  constructor(reg) { this.reg = reg; this.byId = Object.fromEntries(reg.map(r => [r.sid, r])); this.thr = 25; this.keys = []; this.last = {}; this.prev = {}; this.seq = {}; this.attacks = []; this.vms = 0; }
  async init() {
    const gk = () => crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']);
    this.keys = await Promise.all(this.reg.map(gk)); this.attacker = await gk();
    this.reg.forEach(r => { this.last[r.sid] = 0; this.seq[r.sid] = 0; });
  }
  sign(key, m) { return crypto.subtle.sign(ALG, key.privateKey, enc.encode(canon(m))); }
  /** Same order of checks as the PHP side: identity, signature, sequence, location, segment. */
  async verify(m) {
    const r = this.byId[m.sid]; if (!r) return 1;
    if (!await crypto.subtle.verify(ALG, this.keys[r.i].publicKey, m.sig, enc.encode(canon(m)))) return 2;
    if (m.seq <= this.last[m.sid]) return 3;
    if (meters(m.lon, m.lat, r.lon, r.lat) > this.thr) return 4;
    if (m.seg !== r.seg) return 5;
    this.last[m.sid] = m.seq; return 0;
  }
  async forge(m, atk, r) {
    if (atk === 1) { m.lat += .002; m.v = 1.8; return m; }                                   // edited after signing: signature no longer matches
    if (atk === 4) return this.prev[m.sid] ?? (m.lat += .002, m.v = 1.8, m);                 // old valid message sent again
    if (atk === 2) { const d = 15 + Math.random() * 105, a = Math.random() * 6.283; m.lat += d * Math.sin(a) / 110574; m.lon += d * Math.cos(a) / 111320; }   // valid key, 15-120 m away
    if (atk === 3) m.sid = 'X-901';
    if (atk === 5) m.seg = this.reg[(r.i + 7) % this.reg.length].seg;
    m.v = 1.8; m.sig = await this.sign(atk === 3 ? this.attacker : this.keys[r.i], m);       // P2, P3, P5, P6 are validly signed
    return m;
  }
  /** readings: [idx, vibration, vehicles, 0, speed]. Returns rows: [idx, v, vol, code, spd, dist, atk, (claimedLon, claimedLat)]. */
  async process(readings) {
    const t0 = performance.now(); let n = 0;
    const rows = await Promise.all(readings.map(async ([i, v, vol, , spd]) => {
      const r = this.reg[i], sid = r.sid, m = { sid, seg: r.seg, seq: ++this.seq[sid], lon: r.lon + gauss() * 6 / 111320, lat: r.lat + gauss() * 6 / 110574, v, vol, spd };
      m.sig = await this.sign(this.keys[i], m);
      const q = this.attacks.findIndex(a => a[1] === i); let atk = 0, msg = m;
      if (q >= 0) { atk = +this.attacks[q][0].slice(1); this.attacks.splice(q, 1); msg = await this.forge({ ...m }, atk, r); } else this.prev[sid] = { ...m };
      const code = await this.verify(msg); n++;
      const reg = this.byId[msg.sid], dist = reg ? Math.round(meters(msg.lon, msg.lat, reg.lon, reg.lat)) : 0, row = [i, +msg.v.toFixed(3), msg.vol, code, msg.spd, dist, atk];
      if (code || atk) row.push(+msg.lon.toFixed(6), +msg.lat.toFixed(6));
      return row;
    }));
    this.vms = n ? (performance.now() - t0) / n : 0;   // sign + verify per message, measured in this browser
    return rows;
  }
}
