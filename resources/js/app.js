import './echo';
import * as Cesium from 'cesium';

window.CESIUM_BASE_URL = '/cesium/';

// ======================================================================
// 1. INISIALISASI VIEWER & ENVIRONMENT 3D
// ======================================================================
const viewer = new Cesium.Viewer('cesiumContainer', {
    animation: true,
    timeline: true,
    infoBox: true,
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    navigationHelpButton: false,
    sceneModePicker: false,
    shouldAnimate: true,
    terrain: Cesium.Terrain.fromWorldTerrain()
});

viewer.scene.globe.depthTestAgainstTerrain = true;

// Load Gedung 3D OSM
Cesium.createOsmBuildingsAsync().then(function(tileset) {
    viewer.scene.primitives.add(tileset);
});

// Arahkan Kamera Bebas (Perspektif Normal dari Atas)
viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(-122.3985, 37.7915, 450),
    orientation: {
        heading: Cesium.Math.toRadians(45.0),
        pitch: Cesium.Math.toRadians(-35.0)
    }
});


// ======================================================================
// 2. LOAD SIMULASI LALU LINTAS CZML (KAMERA NORMAL BEBAS)
// ======================================================================
Cesium.CzmlDataSource.load('/test_traffic.czml').then(function(dataSource) {
    viewer.dataSources.add(dataSource);
    // KETERANGAN: viewer.trackedEntity sengaja TIDAK dipasang agar kamera tetap bebas & normal.
}).catch(function(error) {
    console.error("Gagal memuat CZML:", error);
});


// ======================================================================
// 3. FITUR SENSOR IOT (CRUD)
// ======================================================================
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
let isPickingCoord = false;

const btnPick = document.getElementById('btn-pick-coord');
if (btnPick) {
    btnPick.addEventListener('click', function() {
        isPickingCoord = true;
        alert("Mode Pilih Titik Aktif: Klik pada area peta untuk menaruh sensor IoT!");
    });
}

handler.setInputAction(function (click) {
    if (!isPickingCoord) return;

    const ray = viewer.camera.getPickRay(click.position);
    let cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    if (!Cesium.defined(cartesian)) {
        cartesian = viewer.camera.pickEllipsoid(click.position, viewer.scene.globe.ellipsoid);
    }

    if (Cesium.defined(cartesian)) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lon = Cesium.Math.toDegrees(cartographic.longitude);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const height = cartographic.height;

        const sensorId = document.getElementById('input-id').value;
        const segmentId = document.getElementById('input-segment').value;
        const detection = document.getElementById('input-detection').value;
        const isWarning = detection !== 'Normal / Mulus';

        fetch('/api/sensors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': '{{ csrf_token }}' },
            body: JSON.stringify({
                sensor_id: sensorId, segment_id: segmentId, detection: detection,
                status: isWarning ? 'warning' : 'normal',
                vibration: isWarning ? (Math.random() * 5 + 4).toFixed(1) : 1.2,
                temperature: (Math.random() * 5 + 30).toFixed(1),
                lat: lat, lng: lon, alt: height
            })
        }).then(res => res.json()).then(() => {
            isPickingCoord = false;
            loadSensors();
        });
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

const sensorEntities = {};

async function loadSensors() {
    try {
        const response = await fetch('/api/sensors');
        const sensors = await response.json();
        let cardsHtml = '';
        const existingIds = sensors.map(s => s.sensor_id);

        for (let id in sensorEntities) {
            if (!existingIds.includes(id)) {
                viewer.entities.remove(sensorEntities[id]);
                delete sensorEntities[id];
            }
        }

        sensors.forEach(sensor => {
            const isWarning = sensor.status === 'warning';
            cardsHtml += `
                <div class="sensor-card" style="background: #f7fafc; padding: 8px; border-radius: 6px; margin-bottom: 6px; border-left: 4px solid ${isWarning ? '#f56565' : '#48bb78'}; font-size: 0.85rem;">
                    <b>${sensor.sensor_id}</b> (${sensor.segment_id})<br>
                    Deteksi: <b>${sensor.detection || 'Normal'}</b><br>
                    Status: ${isWarning ? '⚠️ WARNING' : '✅ NORMAL'}<br>
                    <button onclick="deleteSensor('${sensor.sensor_id}')" style="background:#e74c3c; color:white; border:none; padding:3px 6px; border-radius:4px; font-size:0.75rem; cursor:pointer; margin-top:4px;">Hapus</button>
                </div>`;

            const color = isWarning ? Cesium.Color.RED : Cesium.Color.LIMEGREEN;
            const altitude = sensor.alt ? sensor.alt : 0;

            if (!sensorEntities[sensor.sensor_id]) {
                sensorEntities[sensor.sensor_id] = viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(sensor.lng, sensor.lat, altitude),
                    point: { pixelSize: 18, color: color, outlineColor: Cesium.Color.WHITE, outlineWidth: 3 },
                    label: {
                        text: `${sensor.sensor_id}`,
                        font: 'bold 11pt sans-serif', style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.WHITE, outlineColor: Cesium.Color.BLACK, outlineWidth: 4,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM, pixelOffset: new Cesium.Cartesian2(0, -20)
                    }
                });
            } else {
                sensorEntities[sensor.sensor_id].point.color = color;
            }
        });

        const container = document.getElementById('sensor-cards-container');
        if (container) container.innerHTML = cardsHtml || 'Belum ada sensor.';
    } catch (error) { console.error("Gagal load sensor:", error); }
}

window.deleteSensor = function(id) {
    if (confirm(`Hapus sensor ${id}?`)) {
        fetch(`/api/sensors/${id}`, { method: 'DELETE' }).then(() => loadSensors());
    }
};

loadSensors();
setInterval(loadSensors, 5000);
