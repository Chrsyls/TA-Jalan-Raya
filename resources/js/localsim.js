// Browser traffic simulation (port of app/Twin/Simulator.php). Same rules on both sides:
// signalised junctions, queues (car following), curb parking, bus stops, radius-based sensors.
// Frame rows are compact: [vehicleId, segIdx, metresFromEntryEnd * 10, dir, state]
// state: 0 moving, 1 red light, 2 parked, 3 bus stop, 4 queued behind another vehicle.
const W = { primary: .9, secondary: .7, tertiary: .5 }, MAIN = new Set(['primary', 'secondary', 'tertiary']), PARK = new Set(['residential', 'unclassified', 'living_street', 'tertiary']);
const BRAKE = 3, STOP_LINE = 1.5, PARK_P = .035, BUS_P = .30, WT = { 0: .3, 1: 1, 2: 4 };   // WT: vibration weight of bike / car / bus
const LEN = [1.85, 4.4, 10.5], MINGAP = 2, NODE_CLEAR = 1.2;   // real lengths (m) of motorbike / car / bus, bumper gap (m), seconds between vehicles of different approaches entering a junction
const kindIdx = id => id % 10 < 6 ? 0 : id % 10 < 9 ? 1 : 2;
/** Centre-to-centre distance a follower needs behind a leader: half of each vehicle plus a bumper gap (a bus needs far more room than a bike). */
export const need = (lead, v) => (LEN[kindIdx(lead.id)] + LEN[kindIdx(v.id)]) / 2 + MINGAP;
const laneKey = (seg, dir) => seg * 2 + (dir > 0 ? 0 : 1);
export const LAT0 = -7.30, LON0 = 112.70;   // grid origin for sensor lookup (same constants in PHP)

export class LocalSim {
  constructor(net, n = 300) {
    this.net = net; this.seg = net.seg; this.out = net.out; this.cnt = new Map(); this.veh = []; this.rain = 0; this.t = 0; this.groups = new Map(); this.nodeUse = new Map();
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
  planNext(v) {   // decide the next road ahead of time, so followers can look into it and a vehicle can wait for room before entering
    const g = this.seg[v.seg], all = this.out.get(v.dir > 0 ? g.to : g.from) ?? []; let opts = all.filter(e => e[0] !== v.seg); if (!opts.length) opts = all;
    if (!opts.length) { v.nx = null; return; }
    if (Math.random() < .6) { const best = Math.max(...opts.map(e => this.seg[e[0]].sp)); opts = opts.filter(e => this.seg[e[0]].sp === best); }   // prefer the faster road class
    v.nx = opts[Math.floor(Math.random() * opts.length)];
  }
  clearAt(seg, dir, s, v) { return !this.veh.some(o => o !== v && o.st !== 2 && o.seg === seg && o.dir === dir && Math.abs(o.s - s) < need(o, v)); }
  spawn(id) {
    let v;
    for (let tries = 0; tries < 15; tries++) {   // do not appear on top of another vehicle
      let i; do { i = Math.floor(Math.random() * this.seg.length); } while (Math.random() > (W[this.seg[i].hw] ?? .12));
      const g = this.seg[i]; v = { id, seg: i, dir: (g.ow || Math.random() < .5) ? 1 : -1, s: Math.random() * g.len, v: this.speed(i), u: 0, st: 0, hold: 0, stopAt: null, stopKind: 0, dur: 0, nx: null };
      if (PARK.has(g.hw) && Math.random() < .04) { v.st = 2; v.hold = Math.random() * 120; break; }   // a few vehicles start already parked (at the curb)
      if (this.clearAt(v.seg, v.dir, v.s, v)) break;
    }
    this.planNext(v); if (v.st !== 2) this.planStop(v);
    return v;
  }
  /** Advance by dt simulated seconds. */
  step(dt) {
    if (dt <= 0) return;
    this.t += dt; this.cnt.clear(); const slow = 1 - .35 * this.rain, groups = this.groups = new Map(), leaving = [];
    for (const v of this.veh) {
      this.cnt.set(v.seg, (this.cnt.get(v.seg) ?? 0) + 1);
      if (v.st === 2 || v.st === 3) { v.hold -= dt; if (v.hold <= 0) { if (v.st === 3) { v.st = 0; v.hold = 0; } else leaving.push(v); } }   // boarding is over / parking time is over
      if (v.st !== 2) { const key = laneKey(v.seg, v.dir); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(v); }   // parked cars sit at the curb: not in the lane
      else v.u = 0;
    }
    for (const v of leaving) {   // a parked vehicle pulls out only when the lane is clear around it
      const lane = groups.get(laneKey(v.seg, v.dir)) ?? [];
      if (lane.some(o => Math.abs(o.s - v.s) < need(o, v))) { v.hold = .8; continue; }
      v.st = 0; v.hold = 0; if (!groups.has(laneKey(v.seg, v.dir))) groups.set(laneKey(v.seg, v.dir), lane); lane.push(v);
    }
    for (const list of groups.values()) list.sort((a, b) => b.s - a.s);   // sort every lane first: look-ahead reads the last (rear) vehicle of the next lane
    for (const list of groups.values()) { let lead = null; for (const v of list) { this.move(v, lead, dt, slow); lead = v; } }   // leaders first
    for (let k = 0; k < this.veh.length; k++) if (this.veh[k].s >= this.seg[this.veh[k].seg].len) this.advance(k);
  }
  move(v, lead, dt, slow) {
    if (v.st === 3) { v.u = 0; return; }   // boarding: stays in the lane and blocks it
    const g = this.seg[v.seg], node = v.dir > 0 ? g.to : g.from; let limit = Infinity, why = 0;
    if (this.net.signals.has(node) && !this.net.green(node, this.net.approachGroup(v.seg, v.dir), this.t)) { limit = g.len - STOP_LINE - LEN[kindIdx(v.id)] / 2; why = 1; }   // red: the FRONT stops at the line, so a bus stops further back than a bike
    if (v.stopAt !== null && v.stopAt < limit) { limit = v.stopAt; why = 2; }
    let ld = lead;
    if (!ld && v.nx) {   // nobody ahead on this segment: look at the last vehicle on the next one
      const rear = (this.groups.get(laneKey(v.nx[0], v.nx[1])) ?? []).at(-1);
      if (rear && rear !== v && g.len + rear.s - need(rear, v) < limit) { limit = g.len + rear.s - need(rear, v); why = 3; ld = rear; }
    }
    if (lead && lead.s - need(lead, v) < limit) { limit = lead.s - need(lead, v); why = 3; ld = lead; }
    const gap = limit - v.s; let ds = 0;
    if (gap > 0) ds = gap < .3 ? gap : Math.min(v.v * slow * dt, gap, Math.sqrt(2 * BRAKE * gap) * dt);   // braking curve v <= sqrt(2 b gap)
    v.s += ds; v.u = ds / dt;
    if (why === 2 && v.s >= v.stopAt - .4) { v.st = v.stopKind; v.hold = v.dur; v.stopAt = null; v.u = 0; return; }
    v.st = v.u > .3 ? 0 : why === 1 && v.s >= limit - .6 ? 1 : why === 3 ? (ld.st === 1 ? 1 : (ld.st === 3 || ld.st === 4) ? 4 : 0) : 0;
  }
  advance(k) {
    const v = this.veh[k];
    while (v.s >= this.seg[v.seg].len) {
      const g = this.seg[v.seg], node = v.dir > 0 ? g.to : g.from;
      if (!v.nx) { this.veh[k] = this.spawn(v.id); return; }
      const [ns, nd] = v.nx, lane = this.groups.get(laneKey(ns, nd)) ?? [], rear = lane.at(-1), over = v.s - g.len, use = this.nodeUse.get(node);
      const noRoom = rear && rear.s - over < need(rear, v), busyNode = use && use.from !== v.seg && this.t - use.t < NODE_CLEAR;   // another approach just entered this junction
      if (noRoom || busyNode) { v.s = Math.max(0, g.len - STOP_LINE - LEN[kindIdx(v.id)] / 2); v.u = 0; v.st = 4; return; }   // wait at the end of the segment, try again next step
      this.nodeUse.set(node, { t: this.t, from: v.seg });
      v.seg = ns; v.dir = nd; v.s = over; v.v = this.speed(ns); if (!this.groups.has(laneKey(ns, nd))) this.groups.set(laneKey(ns, nd), lane); lane.push(v);
      this.planNext(v); this.planStop(v);
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
