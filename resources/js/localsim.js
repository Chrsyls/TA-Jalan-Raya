// Browser traffic simulation (port of app/Twin/Simulator.php). Same rules on both sides:
// signalised junctions, queues (car following), curb parking, bus stops, radius-based sensors.
// Frame rows are compact: [vehicleId, segIdx, metresFromEntryEnd * 10, dir, state]
// state: 0 moving, 1 red light, 2 parked, 3 bus stop, 4 queued behind another vehicle.
const W = { primary: .9, secondary: .7, tertiary: .5 }, MAIN = new Set(['primary', 'secondary', 'tertiary']), PARK = new Set(['residential', 'unclassified', 'living_street', 'tertiary']);
const GAP = 6, BRAKE = 3, STOP_LINE = 1.5, PARK_P = .035, BUS_P = .30, WT = { 0: .3, 1: 1, 2: 4 };   // WT: vibration weight of bike / car / bus
const kindIdx = id => id % 10 < 6 ? 0 : id % 10 < 9 ? 1 : 2;
export const LAT0 = -7.30, LON0 = 112.70;   // grid origin for sensor lookup (same constants in PHP)

export class LocalSim {
  constructor(net, n = 300) {
    this.net = net; this.seg = net.seg; this.out = net.out; this.cnt = new Map(); this.veh = []; this.rain = 0; this.t = 0;
    for (let k = 0; k < n; k++) this.veh.push(this.spawn(k));
  }
  setCount(n) { n = Math.max(0, Math.min(2000, n)); while (this.veh.length < n) this.veh.push(this.spawn(this.veh.length)); this.veh.length = Math.min(this.veh.length, n); }
  speed(i) { return this.seg[i].sp / 3.6 * (0.85 + Math.random() * 0.3); }
  planStop(v) {   // on entering a segment: buses may stop at a stop, anyone may park at the curb of a minor road
    const g = this.seg[v.seg]; v.stopAt = null;
    if (v.id % 10 === 9 && MAIN.has(g.hw) && Math.random() < BUS_P) { v.stopAt = g.len * (.35 + Math.random() * .3); v.stopKind = 3; v.dur = 12 + Math.random() * 18; }
    else if (PARK.has(g.hw) && g.len > 40 && Math.random() < PARK_P) { v.stopAt = g.len * (.2 + Math.random() * .6); v.stopKind = 2; v.dur = 20 + Math.random() * 130; }
    if (v.stopAt !== null && v.stopAt <= v.s + 3) v.stopAt = null;
  }
  spawn(id) {
    let i; do { i = Math.floor(Math.random() * this.seg.length); } while (Math.random() > (W[this.seg[i].hw] ?? .12));
    const g = this.seg[i], v = { id, seg: i, dir: (g.ow || Math.random() < .5) ? 1 : -1, s: Math.random() * g.len, v: this.speed(i), u: 0, st: 0, hold: 0, stopAt: null, stopKind: 0, dur: 0 };
    if (PARK.has(g.hw) && Math.random() < .04) { v.st = 2; v.hold = Math.random() * 120; } else this.planStop(v);   // a few vehicles start already parked
    return v;
  }
  /** Advance by dt simulated seconds. */
  step(dt) {
    if (dt <= 0) return;
    this.t += dt; this.cnt.clear(); const slow = 1 - .35 * this.rain, groups = new Map();
    for (const v of this.veh) {
      this.cnt.set(v.seg, (this.cnt.get(v.seg) ?? 0) + 1);
      if (v.st === 2 || v.st === 3) { v.hold -= dt; if (v.hold <= 0) { v.st = 0; v.hold = 0; } }   // parking / boarding timers
      if (v.st !== 2) { const key = v.seg * 2 + (v.dir > 0 ? 0 : 1); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(v); }   // parked cars sit at the curb: not in the lane
      else v.u = 0;
    }
    for (const list of groups.values()) { list.sort((a, b) => b.s - a.s); let lead = null; for (const v of list) { this.move(v, lead, dt, slow); lead = v; } }   // leaders first
    for (let k = 0; k < this.veh.length; k++) if (this.veh[k].s >= this.seg[this.veh[k].seg].len) this.advance(k);
  }
  move(v, lead, dt, slow) {
    if (v.st === 3) { v.u = 0; return; }   // boarding: stays in the lane and blocks it
    const g = this.seg[v.seg], node = v.dir > 0 ? g.to : g.from; let limit = Infinity, why = 0;
    if (this.net.signals.has(node) && !this.net.green(node, this.net.approachGroup(v.seg, v.dir), this.t)) { limit = g.len - STOP_LINE; why = 1; }   // red: stop line
    if (v.stopAt !== null && v.stopAt < limit) { limit = v.stopAt; why = 2; }
    if (lead && lead.s - GAP < limit) { limit = lead.s - GAP; why = 3; }
    const gap = limit - v.s; let ds = 0;
    if (gap > 0) ds = gap < .3 ? gap : Math.min(v.v * slow * dt, gap, Math.sqrt(2 * BRAKE * gap) * dt);   // braking curve v <= sqrt(2 b gap)
    v.s += ds; v.u = ds / dt;
    if (why === 2 && v.s >= v.stopAt - .4) { v.st = v.stopKind; v.hold = v.dur; v.stopAt = null; v.u = 0; return; }
    v.st = v.u > .3 ? 0 : why === 1 && v.s >= limit - .6 ? 1 : why === 3 ? (lead.st === 1 ? 1 : (lead.st === 3 || lead.st === 4) ? 4 : 0) : 0;
  }
  advance(k) {
    const v = this.veh[k];
    while (v.s >= this.seg[v.seg].len) {
      const g = this.seg[v.seg]; v.s -= g.len;
      const all = this.out.get(v.dir > 0 ? g.to : g.from) ?? [];
      let opts = all.filter(e => e[0] !== v.seg); if (!opts.length) opts = all;
      if (!opts.length) { this.veh[k] = this.spawn(v.id); return; }
      if (Math.random() < .6) { const best = Math.max(...opts.map(e => this.seg[e[0]].sp)); opts = opts.filter(e => this.seg[e[0]].sp === best); }
      [v.seg, v.dir] = opts[Math.floor(Math.random() * opts.length)]; v.v = this.speed(v.seg); this.planStop(v);
    }
  }
  frame() { return this.veh.map(v => [v.id, v.seg, Math.round(v.s * 10), v.dir, v.st]); }
  /** One reading per sensor from vehicles inside its radius (grid lookup): [idx, vibration g, vehicles in range, code 0, mean speed km/h]. */
  sensorRows(reg) {
    const cell = 250, grid = new Map(), mx = l => (l - LON0) * 111320 * .9919, my = l => (l - LAT0) * 110574, p = [0, 0], key = (a, b) => a * 100003 + b + 1000;
    for (const v of this.veh) { this.net.pos(v.seg, v.s, v.dir, p); const o = { x: mx(p[0]), y: my(p[1]), v }, k = key(Math.floor(o.x / cell), Math.floor(o.y / cell)); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(o); }
    return reg.map(r => {
      const x = mx(r.lon), y = my(r.lat), cx = Math.floor(x / cell), cy = Math.floor(y / cell); let vol = 0, w = 0, sp = 0, m = 0;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const o of grid.get(key(cx + a, cy + b)) ?? []) {
        if (Math.hypot(o.x - x, o.y - y) > r.r) continue; vol++; w += WT[kindIdx(o.v.id)]; if (o.v.st !== 2) { sp += o.v.u; m++; }
      }
      return [r.i, +(.12 + this.seg[r.seg_idx].iri / 15 + .02 * w + (Math.random() - .5) * .08).toFixed(3), vol, 0, m ? Math.round(sp / m * 3.6) : 0];
    });
  }
}
