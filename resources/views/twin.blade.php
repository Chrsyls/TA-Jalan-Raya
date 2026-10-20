<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>National Road Digital Twin</title>
  <link rel="preconnect" href="https://cesium.com">
  <link rel="preconnect" href="https://tile.openstreetmap.org" crossorigin>
  <link rel="preload" as="fetch" href="/data/segments.min.json.gz" crossorigin>
  <link rel="stylesheet" href="https://cesium.com/downloads/cesiumjs/releases/1.124/Build/Cesium/Widgets/widgets.css">
  <script src="https://cesium.com/downloads/cesiumjs/releases/1.124/Build/Cesium/Cesium.js"></script>
  <style>
    html, body, #cesium { margin: 0; height: 100%; font: 13px system-ui, sans-serif }
    #hud { position: absolute; top: 10px; left: 10px; z-index: 5; background: #000b; color: #eee; padding: 10px 12px; border-radius: 8px; width: 300px; line-height: 1.55 }
    #hud b { color: #fff } #hud button { margin: 2px 4px 2px 0; cursor: pointer } #hud label { display: block }
    #msg { color: #ffb4b4 } #info { margin-top: 6px; color: #ffd24a }
    .k { display: inline-block; width: 10px; height: 10px; margin-right: 4px; border-radius: 2px }
  </style>
  @vite(['resources/js/twin.js'])
</head>
<body>
  <div id="cesium"></div>
  <div id="hud">
    <b>National Road Digital Twin</b><br><span id="mode">starting…</span>
    <div><button data-l="iri">Condition (IRI)</button><button data-l="den">Traffic density</button></div>
    <div><button id="bld">Buildings</button><button id="follow">Follow a vehicle</button><button id="reset">Reset view</button></div>
    <label>Vehicle size <input id="size" type="range" min="1" max="8" value="3"></label>
    <span class="k" style="background:#ffb020"></span>motorbike <span class="k" style="background:#2d9cff"></span>car <span class="k" style="background:#ff5a5f"></span>bus<br>
    Vehicles <b id="nv">0</b> · sensors ok <b id="ok">0</b> / rejected <b id="rej">0</b><br>
    Latency (server to render) p50 <b id="p50">–</b> · p95 <b id="p95">–</b> ms<br>
    <div id="msg"></div><div id="info">Click a road, sensor or vehicle. Right-drag to tilt.</div>
    <small>URL options: <code>?mode=poll</code> (5 s sensor polling), <code>?mode=local</code> (browser-only traffic), <code>?n=500</code> (vehicles, local).</small>
  </div>
</body>
</html>
