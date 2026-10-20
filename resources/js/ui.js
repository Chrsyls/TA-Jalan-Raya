// Dashboard UI: injected by JS so an old twin.blade.php cannot break it. No blur effects (they are costly over a WebGL canvas).
export const $ = s => document.querySelector(s) ?? { style: {}, click() {}, classList: { add() {}, remove() {}, toggle() {} }, dataset: {} };
export const kv = (k, v, f) => `<div class="kv"><span>${k}</span><b${f ? ` data-f="${f}"` : ''}>${v}</b></div>`;
export function spark(cv, arr, color, max) {
  const c = cv.getContext?.('2d'); if (!c) return; const w = cv.width, h = cv.height; c.clearRect(0, 0, w, h); if (arr.length < 2) return;
  const m = max ?? Math.max(1, ...arr); c.strokeStyle = color; c.lineWidth = 1.6; c.beginPath();
  arr.forEach((v, i) => { const x = i / (arr.length - 1) * w, y = h - 2 - (v / m) * (h - 4); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
}
const I = p => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  layers: I('<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>'),
  weather: I('<path d="M7 17a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.2 4.2 0 0 1-.5 8H7Z"/><path d="m9 20 1-2m4 2 1-2"/>'),
  traffic: I('<path d="M4 16h16M6 16l1.6-6h8.8L18 16M7.5 16v2.5M16.5 16v2.5"/>'),
  events: I('<path d="M6 17v-6a6 6 0 1 1 12 0v6l2 2H4l2-2Z"/><path d="M10 21h4"/>'),
  system: I('<circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1"/>'),
};
const sw = (id, label, on) => `<label class="sw"><input type="checkbox" id="${id}"${on ? ' checked' : ''}><i></i><span>${label}</span></label>`;
const CSS = `
:root{--bg:rgba(11,17,24,.9);--bg2:rgba(255,255,255,.06);--line:rgba(255,255,255,.1);--ink:#e8eef5;--mut:#8b9bb0;--acc:#3ee0c4;--warn:#ffb020;--bad:#ff5d6c;--ok:#4ade80}
#ui{position:fixed;inset:0;pointer-events:none;z-index:10;font:13px/1.45 Inter,system-ui,-apple-system,sans-serif;color:var(--ink)}
#ui>*{pointer-events:auto}#ui [hidden]{display:none!important}
#ui button{font:inherit;color:inherit;cursor:pointer;border:0;background:var(--bg2);border-radius:9px;padding:6px 10px;transition:background .15s,transform .1s}
#ui button:hover{background:rgba(255,255,255,.12)}#ui button:active{transform:scale(.97)}#ui button:focus-visible,#ui input:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.glass{background:var(--bg);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.35)}
#top{position:absolute;top:12px;left:12px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;max-width:calc(100% - 24px)}
.brand{display:flex;align-items:center;gap:9px;padding:8px 14px 8px 10px}.brand b{font-weight:650;letter-spacing:.2px}.brand small{color:var(--mut)}
.logo{width:22px;height:22px;border-radius:7px;background:conic-gradient(from 210deg,#3ee0c4,#2d9cff,#a78bfa,#3ee0c4);box-shadow:0 0 14px #3ee0c455}
.chip{padding:6px 11px;border-radius:99px;background:var(--bg);border:1px solid var(--line);font-size:12px;color:var(--mut);white-space:nowrap;font-variant-numeric:tabular-nums}
.chip.live{color:var(--ok)}.chip.local{color:var(--warn)}.chip b{color:var(--ink);font-weight:600}
#rail{position:absolute;left:12px;top:64px;display:flex;flex-direction:column;gap:4px;padding:6px}
#rail button{position:relative;width:40px;height:40px;padding:0;display:grid;place-items:center;background:transparent;color:var(--mut)}
#rail button svg{width:21px;height:21px}#rail button.on{background:var(--acc);color:#04211c}
#rail .bd{position:absolute;top:2px;right:2px;min-width:16px;height:16px;border-radius:8px;background:var(--bad);color:#fff;font-size:10px;line-height:16px;text-align:center;padding:0 4px}
#panel{position:absolute;left:72px;top:64px;width:310px;max-height:calc(100% - 190px);overflow:auto;padding:14px 16px}
#panel h3{margin:14px 0 8px;font-size:11px;font-weight:600;color:var(--mut);letter-spacing:.8px;text-transform:uppercase}#panel h3:first-child{margin-top:0}
.seg{display:flex;gap:2px;padding:3px;background:var(--bg2);border-radius:11px}.seg button{flex:1;background:transparent;padding:6px 4px;font-size:12px}.seg button.on{background:var(--acc);color:#04211c;font-weight:600}
.row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:8px 0}.row span{color:var(--mut)}.row b{font-variant-numeric:tabular-nums;font-weight:600}
input[type=range]{width:100%;accent-color:var(--acc);margin:2px 0 6px}
.sw{display:flex;align-items:center;gap:10px;margin:8px 0;cursor:pointer}.sw input{position:absolute;opacity:0}.sw i{width:34px;height:20px;border-radius:10px;background:rgba(255,255,255,.14);position:relative;transition:background .15s;flex:none}
.sw i:after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform .15s}.sw input:checked+i{background:var(--acc)}.sw input:checked+i:after{transform:translateX(14px)}.sw input:focus-visible+i{outline:2px solid var(--acc);outline-offset:2px}
.legend{display:flex;align-items:center;gap:8px;margin-top:8px;color:var(--mut);font-size:12px}.rp{display:block;width:80px;height:8px;border-radius:4px;flex:none;background:linear-gradient(90deg,hsl(119 70% 45%),hsl(60 70% 45%),hsl(0 70% 45%))}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}.mut{color:var(--mut)}.small{font-size:12px}
#events{list-style:none;margin:8px 0 0;padding:0;display:flex;flex-direction:column;gap:6px}.ev{display:grid;grid-template-columns:54px 1fr;gap:8px;padding:8px 10px;border-radius:10px;background:var(--bg2);border-left:3px solid var(--mut);cursor:pointer}
.ev time{color:var(--mut);font-variant-numeric:tabular-nums}.ev.warn{border-color:var(--warn)}.ev.alert{border-color:var(--bad)}.ev.ok{border-color:var(--ok)}
#card{position:absolute;right:12px;top:12px;width:310px;padding:14px 16px;max-height:calc(100% - 130px);overflow:auto}
.chead{display:flex;align-items:center;gap:10px}.chead h4{margin:0;font-size:15px;font-weight:650}.chead small{color:var(--mut)}.chead>div{flex:1;min-width:0}.chead .dot{width:14px;height:14px;margin:0}
.chead button{padding:4px 8px}
.big{display:flex;align-items:baseline;gap:6px;margin:12px 0 6px}.big b{font-size:34px;font-weight:700;font-variant-numeric:tabular-nums;line-height:1}.big span{color:var(--mut)}
.st{margin-left:auto;font-style:normal;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:rgba(74,222,128,.15);color:var(--ok)}.st.slow{background:rgba(255,176,32,.15);color:var(--warn)}.st.bad{background:rgba(255,93,108,.16);color:var(--bad)}
.meter{position:relative;height:6px;border-radius:3px;background:var(--bg2);margin-bottom:10px}.meter i{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--acc);transition:width .25s}.meter u{position:absolute;top:-3px;bottom:-3px;width:2px;background:#fff9}
.kv{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-top:1px solid var(--line)}.kv span{color:var(--mut)}.kv b{font-weight:550;text-align:right;font-variant-numeric:tabular-nums}
.acts{display:flex;gap:6px;margin-top:12px;flex-wrap:wrap}.acts button.on{background:var(--acc);color:#04211c}
#kpi{position:absolute;left:50%;transform:translateX(-50%);bottom:28px;display:flex;gap:2px;padding:8px 6px}
.k{display:flex;flex-direction:column;gap:1px;padding:2px 16px;min-width:88px;border-right:1px solid var(--line)}.k:last-child{border:0}.k small{color:var(--mut);font-size:11px}.k b{font-size:19px;font-weight:650;font-variant-numeric:tabular-nums}.k canvas{width:90px;height:26px;margin-top:2px}
#toast{position:absolute;left:50%;top:14px;transform:translateX(-50%);padding:9px 16px;border-radius:10px;background:var(--bad);color:#fff;font-weight:500;max-width:90%}
@media(max-width:800px){#panel{left:12px;right:12px;top:auto;bottom:84px;width:auto;max-height:44%}#rail{top:auto;bottom:12px;flex-direction:row}#kpi{display:none}#card{left:12px;right:12px;top:58px;width:auto;max-height:40%}.brand small{display:none}}
@media(prefers-reduced-motion:reduce){#ui *{transition:none!important}}`;

export function mountUI() {
  document.querySelector('#hud')?.remove();
  if (!document.getElementById('cesium')) document.body.insertAdjacentHTML('afterbegin', '<div id="cesium"></div>');
  document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"><style>${CSS}</style>`);
  const rail = ['layers', 'weather', 'traffic', 'events', 'system'].map(t => `<button data-tab="${t}" title="${t[0].toUpperCase() + t.slice(1)}" aria-label="${t}">${ICON[t]}${t === 'events' ? '<span class="bd" id="bd" hidden></span>' : ''}</button>`).join('');
  document.body.insertAdjacentHTML('beforeend', `<div id="ui">
<div id="top"><div class="brand glass"><span class="logo"></span><b>Road Twin</b><small>ITS road network</small></div>
 <span class="chip" id="srcChip">starting…</span><span class="chip" id="spdChip">1×</span><span class="chip" id="fpsChip">– fps</span><span class="chip" id="clockChip">12:00</span></div>
<nav id="rail" class="glass" aria-label="Panels">${rail}</nav>
<aside id="panel" class="glass" hidden>
 <section data-sec="layers" hidden><h3>Road layer</h3>
  <div class="seg"><button data-l="iri" class="on">Condition</button><button data-l="den">Density</button><button data-l="spd">Speed</button></div>
  <div class="legend"><i class="rp"></i><span id="lgt"></span></div>
  <h3>Basemap</h3><div class="seg"><button data-sat="0" class="on">Map</button><button data-sat="55">Blend</button><button data-sat="100">Satellite</button></div>
  <label class="row"><span>Satellite opacity</span><b id="satv">0%</b></label><input id="sat" type="range" min="0" max="100" value="0">
  <h3>Show</h3>${sw('swSen', 'Sensor poles', true)}${sw('swCov', 'Sensor coverage radius', true)}${sw('swSig', 'Traffic signals', true)}<p class="mut small" style="margin:0 0 6px">Signal dots show the east-west phase: green go, red stop, orange all red.</p>${sw('swBld', 'Buildings (3D, loads terrain)', false)}
  <div class="row"><span><i class="dot" style="background:#ffb020"></i>Motorbikes</span>${sw('fBike', '', true)}</div>
  <div class="row"><span><i class="dot" style="background:#2d9cff"></i>Cars</span>${sw('fCar', '', true)}</div>
  <div class="row"><span><i class="dot" style="background:#ff5a5f"></i>Buses</span>${sw('fBus', '', true)}</div>
  <h3>Scale</h3><label class="row"><span>Vehicle size</span></label><input id="size" type="range" min="1" max="10" value="5">
  <label class="row"><span>Building height offset</span><b id="boffv">0 m</b></label><input id="boff" type="range" min="-80" max="80" value="0"></section>
 <section data-sec="weather" hidden><h3>Rain</h3>
  <div class="seg"><button data-rain="0" class="on">Clear</button><button data-rain="0.25">Light</button><button data-rain="0.6">Heavy</button><button data-rain="1">Storm</button></div>
  <label class="row"><span>Intensity</span><b id="rainv">0% · traffic ×1.00</b></label><input id="rain" type="range" min="0" max="100" value="0">
  <h3>Time of day</h3><label class="row"><span>Clock</span><b id="hourv">12:00</b></label><input id="hour" type="range" min="0" max="24" step="0.25" value="12">
  ${sw('swProfile', 'Traffic follows a daily profile', false)}<button id="play">Play day</button>
  <p class="mut small">Night darkens the map. The profile adds morning and evening peaks on top of the traffic volume setting.</p></section>
 <section data-sec="traffic" hidden><h3>Volume</h3><label class="row"><span>Vehicles</span><b id="nvehv">300</b></label><input id="nveh" type="range" min="50" max="1000" step="50" value="300">
  <h3>Simulation speed</h3><div class="seg"><button data-spd="0">Pause</button><button data-spd="0.5">0.5×</button><button data-spd="1" class="on">1×</button><button data-spd="2">2×</button><button data-spd="4">4×</button><button data-spd="8">8×</button></div>
  <p class="mut small">Signals, parking times and bus stops run on simulated time, so they speed up with it.</p><h3>Right now</h3><div id="tfacts" class="small"></div></section>
 <section data-sec="events" hidden><h3>Event feed</h3><div class="acts" style="margin:0"><button id="evClear">Clear</button><button id="evCsv">Export CSV</button></div><ul id="events"></ul></section>
 <section data-sec="system" hidden><h3>Quality</h3><div class="seg"><button data-q="auto" class="on">Auto</button><button data-q="low">Low</button><button data-q="medium">Medium</button><button data-q="high">High</button></div>
  <p id="perf" class="mut small">–</p><h3>Latency, server to render</h3><div class="row"><span>p50</span><b id="p50">–</b></div><div class="row"><span>p95</span><b id="p95">–</b></div>
  <h3>Tools</h3><div class="acts" style="margin:0"><button id="reset">Street view</button><button id="overview">Overview</button><button id="snap">Snapshot</button></div>
  <p class="mut small" style="margin-top:12px">URL options: <code>?mode=local</code> browser-only traffic, <code>?mode=poll</code> 5 s sensor polling, <code>?n=500</code> local vehicles. Esc clears the selection.</p></section>
</aside>
<aside id="card" class="glass" hidden></aside>
<footer id="kpi" class="glass"><div class="k"><small>Vehicles</small><b id="kV">0</b></div>
 <div class="k"><small>Avg speed</small><b id="kS">–</b><canvas id="spS" width="90" height="26"></canvas></div>
 <div class="k"><small>Congested</small><b id="kC">0%</b><canvas id="spC" width="90" height="26"></canvas></div>
 <div class="k"><small>Sensors ok / rejected</small><b id="kN">0 / 0</b></div><div class="k"><small>Latency p95</small><b id="kL">–</b></div></footer>
<div id="toast" hidden></div></div>`);
  const panel = $('#panel'); let tab = null;
  document.querySelectorAll('#rail [data-tab]').forEach(b => b.onclick = () => {
    tab = tab === b.dataset.tab ? null : b.dataset.tab; panel.hidden = !tab;
    document.querySelectorAll('#rail [data-tab]').forEach(x => x.classList.toggle('on', x.dataset.tab === tab));
    document.querySelectorAll('#panel [data-sec]').forEach(s => { s.hidden = s.dataset.sec !== tab; });
    document.dispatchEvent(new CustomEvent('twin:tab', { detail: tab }));
  });
  document.querySelectorAll('#ui .seg').forEach(g => g.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { g.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); } }));
  $('#rail [data-tab="layers"]').click();
}
