// Shared road network for the browser: decodes the packed segments and gives positions along a segment.
const SPEED = { primary: 40, primary_link: 30, secondary: 35, secondary_link: 28, tertiary: 30, tertiary_link: 25, unclassified: 25, residential: 20, living_street: 12 };
const MAJOR = new Set(['primary', 'secondary', 'tertiary']);
export const dist = (a, b) => Math.hypot((a[0] - b[0]) * 111320 * Math.cos((a[1] + b[1]) * Math.PI / 360), (a[1] - b[1]) * 110574);

export function decodeSegments(j) {
  return j.s.map((r, idx) => {
    const [hi, ni, len10, lanes, ow, from, to, iri10, ...xy] = r, c = []; let x = 0, y = 0;
    for (let k = 0; k < xy.length; k += 2) { x += xy[k]; y += xy[k + 1]; c.push([x / j.q, y / j.q]); }
    const hw = j.hw[hi];
    return { id: 'S-' + String(idx + 1).padStart(4, '0'), idx, name: j.nm[ni], hw, len: len10 / 10, lanes, ow, from, to, sp: SPEED[hw], iri: iri10 / 10, c };
  });
}

export class Net {
  constructor(segs) {
    this.out = new Map();
    const add = (node, e) => { if (!this.out.has(node)) this.out.set(node, []); this.out.get(node).push(e); };
    this.nodePos = new Map(); this.signals = new Map(); this._grp = [];
    this.seg = segs.map((p, i) => {
      const cum = [0]; for (let k = 1; k < p.c.length; k++) cum.push(cum[k - 1] + dist(p.c[k - 1], p.c[k]));
      add(p.from, [i, 1]); if (!p.ow) add(p.to, [i, -1]); this.nodePos.set(p.from, p.c[0]); this.nodePos.set(p.to, p.c.at(-1));
      return { ...p, cum, len: cum.at(-1) };
    });
    // Signalised junctions: 3+ roads meet and at least one is a main road. Cycle 60/75/90 s, offset by node id (same formula as the PHP side).
    this.out.forEach((edges, node) => { if (edges.length >= 3 && edges.some(([i]) => MAJOR.has(this.seg[i].hw))) { const P = 60 + 15 * (node % 3); this.signals.set(node, { P, off: (node * 37) % P }); } });
  }
  /** Two-phase signal groups: 0 = traffic arriving mostly east-west, 1 = mostly north-south (integer-safe test, no trig). */
  approachGroup(i, dir) {
    const k = i * 2 + (dir > 0 ? 0 : 1); let g = this._grp[k];
    if (g === undefined) { const c = this.seg[i].c, n = c.length, a = dir > 0 ? c[n - 2] : c[1], b = dir > 0 ? c[n - 1] : c[0]; g = this._grp[k] = Math.abs((b[0] - a[0]) * 0.9917) > Math.abs(b[1] - a[1]) ? 0 : 1; }
    return g;
  }
  /** Is the light green for group grp at simulation time t (seconds)? Nodes without a signal are always open. 4% all-red between phases. */
  green(node, grp, t) {
    const sg = this.signals.get(node); if (!sg) return true;
    const ph = ((t + sg.off) % sg.P) / sg.P;
    return ph < .46 ? grp === 0 : ph < .5 ? false : ph < .96 ? grp === 1 : false;
  }
  /** Writes [lon, lat] into out: s metres after the entry end of segment i, travelling in dir (+1 / -1). */
  pos(i, s, dir, out) {
    const g = this.seg[i], d = Math.min(g.len, Math.max(0, dir > 0 ? s : g.len - s)), n = g.cum.length;
    for (let k = 1; k < n; k++) if (g.cum[k] >= d || k === n - 1) {
      const t = Math.max(0, Math.min(1, (d - g.cum[k - 1]) / Math.max(1e-9, g.cum[k] - g.cum[k - 1]))), a = g.c[k - 1], b = g.c[k];
      out[0] = a[0] + (b[0] - a[0]) * t; out[1] = a[1] + (b[1] - a[1]) * t; return out;
    }
    out[0] = g.c[0][0]; out[1] = g.c[0][1]; return out;
  }
}
