<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('dashboard');
});

// GET: Mengambil daftar sensor
Route::get('/api/sensors', function (Request $request) {
    $sensors = session()->get('custom_sensors', []);
    return response()->json(array_values($sensors));
});

// POST: Menambah sensor (Create)
Route::post('/api/sensors', function (Request $request) {
    $sensors = session()->get('custom_sensors', []);

    $sensorId = $request->input('sensor_id', 'S-' . rand(100, 999));

    $newSensor = [
        'sensor_id' => $sensorId,
        'segment_id' => $request->input('segment_id', 'SEG-BARU'),
        'lat' => floatval($request->input('lat')),
        'lng' => floatval($request->input('lng')),
        'vibration' => floatval($request->input('vibration', 1.2)),
        'temperature' => floatval($request->input('temperature', 31.5)),
        'status' => $request->input('status', 'normal'),
        'detection' => $request->input('detection', 'Normal / Mulus')
    ];

    // Simpan dengan key sensor_id agar tidak duplikat
    $sensors[$sensorId] = $newSensor;
    session()->put('custom_sensors', $sensors);

    return response()->json(['success' => true, 'sensor' => $newSensor]);
});

// DELETE: Hapus sensor
Route::delete('/api/sensors/{id}', function ($id) {
    $sensors = session()->get('custom_sensors', []);

    if (isset($sensors[$id])) {
        unset($sensors[$id]);
        session()->put('custom_sensors', $sensors);
    }

    return response()->json(['success' => true]);
});
