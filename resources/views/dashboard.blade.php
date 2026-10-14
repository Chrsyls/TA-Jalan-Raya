<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Digital Twin Jalan Raya - Surabaya</title>

    <!-- Cesium CSS & Vite Assets -->
    <link href="/cesium/Widgets/widgets.css" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])

    <style>
        html, body, #cesiumContainer { width: 100%; height: 100vh; margin: 0; padding: 0; overflow: hidden; }

        #ui-panel {
            position: absolute; top: 20px; left: 20px;
            background: rgba(255, 255, 255, 0.95); padding: 15px;
            border-radius: 8px; z-index: 10; font-family: 'Segoe UI', sans-serif;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2); width: 380px; max-height: 92vh; overflow-y: auto;
        }

        h2 { margin: 0 0 4px 0; font-size: 1.15rem; font-weight: bold; color: #2d3748; }
        .subtitle { margin: 0 0 12px 0; font-size: 0.85rem; color: #718096; }

        .btn {
            width: 100%; padding: 9px; color: white; border: none;
            border-radius: 5px; font-weight: bold; cursor: pointer; margin-bottom: 8px;
            font-size: 0.85rem; transition: background 0.2s;
        }
        .btn-green { background-color: #27ae60; }
        .btn-green:hover { background-color: #219653; }
        .btn-blue { background-color: #3498db; }
        .btn-blue:hover { background-color: #2980b9; }

        .section-box { background: #f7fafc; padding: 10px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e2e8f0; }
        .form-group { margin-bottom: 8px; }
        .form-group label { display: block; font-size: 0.78rem; font-weight: bold; color: #4a5568; margin-bottom: 3px; }
        .form-group input, .form-group select { width: 100%; padding: 6px; border: 1px solid #cbd5e0; border-radius: 4px; font-size: 0.85rem; box-sizing: border-box; }

        #sensor-list { font-size: 0.85rem; border-top: 1px solid #e2e8f0; padding-top: 10px; margin-top: 10px; }
    </style>
</head>
<body>
    <div id="ui-panel">
        <h2>Digital Twin Jalan Raya</h2>
        <p class="subtitle">Surabaya Road Mapping & IoT Monitoring</p>

                <!-- Form Upload GeoJSON Dinamis -->
        <div class="control-group" style="background: #edf2f7; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
            <label style="font-weight: bold; font-size: 0.85rem; color: #2d3748; display: block; margin-bottom: 5px;">📁 Upload GeoJSON Jalan & Simulasi:</label>
            <input type="file" id="geojson-file-input" accept=".geojson, .json" style="font-size: 0.8rem; width: 100%;">
            <small style="color: #718096; display: block; margin-top: 4px;">Pilih file .geojson untuk merender jalan & rute mobil otomatis.</small>
        </div>

        <!-- 2. PANEL TAMBAH SENSOR & SEGMEN -->
        <div class="section-box">
            <b style="font-size: 0.85rem; color: #2d3748;">Tambah Titik Sensor:</b>
            <div class="form-group" style="margin-top: 6px;">
                <label>ID Sensor:</label>
                <input type="text" id="input-id" value="S-001">
            </div>
            <div class="form-group">
                <label>Nama Segmen:</label>
                <input type="text" id="input-segment" value="SEG-KERTAJAYA">
            </div>
            <div class="form-group">
                <label>Hasil Deteksi / Kondisi:</label>
                <select id="input-detection">
                    <option value="Normal / Mulus">Normal / Mulus</option>
                    <option value="Retak Rambut (D00)">Retak Rambut (D00)</option>
                    <option value="Retak Buaya (D20)">Retak Buaya (D20)</option>
                    <option value="Lubang Parah (D40)">Lubang Parah (D40)</option>
                </select>
            </div>
            <button class="btn btn-blue" id="btn-pick-coord">Pilih Lokasi Sensor di Peta</button>
        </div>

        <!-- 3. DAFTAR SEGMEN & SENSOR AKTIF -->
        <div id="sensor-list">
            <b>Daftar Segmen & Sensor Aktif:</b>
            <div id="sensor-cards-container" style="margin-top: 5px;">Memuat data...</div>
        </div>
    </div>

    <!-- Kanvas Peta Cesium 3D -->
    <div id="cesiumContainer"></div>
</body>
</html>
