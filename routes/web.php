<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, Route};

Route::view('/', 'twin');                                                                   // Cesium dashboard
Route::get('/api/sensors', fn() => response()->file(storage_path('app/twin/sensors.json'), ['Cache-Control' => 'public, max-age=3600'])); // public registry (no secret keys)
Route::get('/api/state', fn() => response()->json(Cache::get('twin.state', ['t' => 0, 'rows' => []]))); // polling baseline

// Scenario controls for the simulator (prototype: GET for simplicity, no auth).
Route::get('/api/control', function (Request $r) {
    if ($r->has('rain')) Cache::put('twin.rain', max(0, min(1, (float) $r->query('rain'))), 86400);
    if ($r->has('n')) Cache::put('twin.n', max(0, min(1000, (int) $r->query('n'))), 86400);
    if ($r->has('thr')) Cache::put('twin.thr', max(5, min(60, (float) $r->query('thr'))), 86400);
    if ($r->has('attack') && preg_match('/^P[1-6]$/', (string) $r->query('attack'))) {   // queue one forged message for a sensor
        $q = Cache::get('twin.attacks', []); $q[] = [$r->query('attack'), (int) $r->query('sensor', 0)]; Cache::put('twin.attacks', array_slice($q, -20), 3600);
    }
    if ($r->has('speed')) Cache::put('twin.speed', max(0, min(8, (float) $r->query('speed'))), 86400);
    return response()->json(['speed' => Cache::get('twin.speed', 1), 'rain' => Cache::get('twin.rain', 0), 'n' => Cache::get('twin.n')]);
});
