<?php
namespace App\Twin;

/**
 * Traffic on the ITS network + radius-based signed sensor telemetry. Same rules as resources/js/localsim.js:
 * signalised junctions, queues (car following), curb parking, bus stops.
 * Vehicle state: 0 moving, 1 red light, 2 parked, 3 bus stop, 4 queued behind another vehicle.
 */
class Simulator
{
    public array $veh = [];
    public array $cnt = [];                 // segIdx => vehicles on segment
    public float $rain = 0.0;               // 0..1, slows traffic by up to 35%
    public float $t = 0.0;                  // simulation seconds (drives the signals)
    private array $sensors, $keys, $seq = [], $prev = [];
    private const W = ['primary' => .9, 'secondary' => .7, 'tertiary' => .5];
    private const MAIN = ['primary' => true, 'secondary' => true, 'tertiary' => true];
    private const PARK = ['residential' => true, 'unclassified' => true, 'living_street' => true, 'tertiary' => true];
    private const GAP = 6, BRAKE = 3, STOP_LINE = 1.5, PARK_P = .035, BUS_P = .30;
    private const WT = [0 => .3, 1 => 1.0, 2 => 4.0];   // vibration weight of bike / car / bus
    private const LAT0 = -7.30, LON0 = 112.70;          // sensor grid origin

    public function __construct(public Network $net, public CryptoSpatial $cs, int $vehicles, private float $forge = 0.0)
    {
        $this->sensors = json_decode(file_get_contents(storage_path('app/twin/sensors.json')), true);
        $this->keys = json_decode(file_get_contents(storage_path('app/twin/keys.json')), true);
        foreach ($this->sensors as $r) { $cs->reg[$r['sid']] = $r; $cs->last[$r['sid']] = 0; }
        for ($k = 0; $k < $vehicles; $k++) $this->veh[] = $this->spawn($k);
    }

    public function sensors(): array { return $this->sensors; }

    public function setCount(int $n): void
    {
        $n = max(0, min(2000, $n));
        while (count($this->veh) < $n) $this->veh[] = $this->spawn(count($this->veh));
        if (count($this->veh) > $n) $this->veh = array_slice($this->veh, 0, $n);
    }

    private function rnd(): float { return mt_rand() / mt_getrandmax(); }

    private function speed(int $i): float { return $this->net->seg[$i]['sp'] / 3.6 * (0.85 + mt_rand(0, 30) / 100); }

    /** On entering a segment: buses may stop at a stop, anyone may park at the curb of a minor road. */
    private function planStop(array &$v): void
    {
        $g = $this->net->seg[$v['seg']]; $v['stopAt'] = null;
        if ($v['id'] % 10 === 9 && isset(self::MAIN[$g['hw']]) && $this->rnd() < self::BUS_P) {
            $v['stopAt'] = $g['len'] * (.35 + $this->rnd() * .3); $v['stopKind'] = 3; $v['dur'] = 12 + $this->rnd() * 18;
        } elseif (isset(self::PARK[$g['hw']]) && $g['len'] > 40 && $this->rnd() < self::PARK_P) {
            $v['stopAt'] = $g['len'] * (.2 + $this->rnd() * .6); $v['stopKind'] = 2; $v['dur'] = 20 + $this->rnd() * 130;
        }
        if ($v['stopAt'] !== null && $v['stopAt'] <= $v['s'] + 3) $v['stopAt'] = null;
    }

    private function spawn(int $id): array
    {
        do { $i = array_rand($this->net->seg); $w = self::W[$this->net->seg[$i]['hw']] ?? .12; } while ($this->rnd() > $w);
        $g = $this->net->seg[$i];
        $v = ['id' => $id, 'seg' => $i, 'dir' => ($g['ow'] || mt_rand(0, 1)) ? 1 : -1, 's' => $this->rnd() * $g['len'], 'v' => $this->speed($i),
            'u' => 0.0, 'st' => 0, 'hold' => 0.0, 'stopAt' => null, 'stopKind' => 0, 'dur' => 0.0];
        if (isset(self::PARK[$g['hw']]) && $this->rnd() < .04) { $v['st'] = 2; $v['hold'] = $this->rnd() * 120; }   // a few vehicles start already parked
        else $this->planStop($v);
        return $v;
    }

    /** Advance by $dt simulated seconds. */
    public function step(float $dt): void
    {
        if ($dt <= 0) return;
        $this->t += $dt; $this->cnt = []; $slow = 1 - .35 * $this->rain; $groups = [];
        foreach ($this->veh as $k => &$v) {
            $this->cnt[$v['seg']] = ($this->cnt[$v['seg']] ?? 0) + 1;
            if ($v['st'] === 2 || $v['st'] === 3) { $v['hold'] -= $dt; if ($v['hold'] <= 0) { $v['st'] = 0; $v['hold'] = 0.0; } }   // parking / boarding timers
            if ($v['st'] !== 2) $groups[$v['seg'] * 2 + ($v['dir'] > 0 ? 0 : 1)][] = $k;   // parked cars sit at the curb: not in the lane
            else $v['u'] = 0.0;
        }
        unset($v);
        foreach ($groups as $list) {   // leaders first
            usort($list, fn($a, $b) => $this->veh[$b]['s'] <=> $this->veh[$a]['s']);
            $lead = null;
            foreach ($list as $k) { $this->move($k, $lead, $dt, $slow); $lead = $k; }
        }
        foreach (array_keys($this->veh) as $k) {
            if ($this->veh[$k]['s'] >= $this->net->seg[$this->veh[$k]['seg']]['len']) $this->advance($k);
        }
    }

    private function move(int $k, ?int $lead, float $dt, float $slow): void
    {
        $v = &$this->veh[$k];
        if ($v['st'] === 3) { $v['u'] = 0.0; return; }   // boarding: stays in the lane and blocks it
        $g = $this->net->seg[$v['seg']]; $node = $v['dir'] > 0 ? $g['to'] : $g['from']; $limit = INF; $why = 0;
        if (isset($this->net->signals[$node]) && !$this->net->green($node, $this->net->approachGroup($v['seg'], $v['dir']), $this->t)) { $limit = $g['len'] - self::STOP_LINE; $why = 1; }   // red: stop line
        if ($v['stopAt'] !== null && $v['stopAt'] < $limit) { $limit = $v['stopAt']; $why = 2; }
        $ld = $lead !== null ? $this->veh[$lead] : null;
        if ($ld && $ld['s'] - self::GAP < $limit) { $limit = $ld['s'] - self::GAP; $why = 3; }
        $gap = $limit - $v['s']; $ds = 0.0;
        if ($gap > 0) $ds = $gap < .3 ? $gap : min($v['v'] * $slow * $dt, $gap, sqrt(2 * self::BRAKE * $gap) * $dt);   // braking curve v <= sqrt(2 b gap)
        $v['s'] += $ds; $v['u'] = $ds / $dt;
        if ($why === 2 && $v['s'] >= $v['stopAt'] - .4) { $v['st'] = $v['stopKind']; $v['hold'] = $v['dur']; $v['stopAt'] = null; $v['u'] = 0.0; return; }
        if ($v['u'] > .3) $v['st'] = 0;
        elseif ($why === 1 && $v['s'] >= $limit - .6) $v['st'] = 1;
        elseif ($why === 3) $v['st'] = $ld['st'] === 1 ? 1 : (($ld['st'] === 3 || $ld['st'] === 4) ? 4 : 0);
        else $v['st'] = 0;
    }

    private function advance(int $k): void
    {
        $v = &$this->veh[$k];
        while ($v['s'] >= $this->net->seg[$v['seg']]['len']) {
            $g = $this->net->seg[$v['seg']]; $v['s'] -= $g['len'];
            $all = $this->net->out[$v['dir'] > 0 ? $g['to'] : $g['from']] ?? [];
            $cur = $v['seg'];
            $opts = array_values(array_filter($all, fn($e) => $e[0] !== $cur));
            if (!$opts) $opts = $all;
            if (!$opts) { $v = $this->spawn($v['id']); return; }
            if (mt_rand(0, 9) < 6) {   // prefer the faster road class
                $best = max(array_map(fn($e) => $this->net->seg[$e[0]]['sp'], $opts));
                $opts = array_values(array_filter($opts, fn($e) => $this->net->seg[$e[0]]['sp'] == $best));
            }
            [$v['seg'], $v['dir']] = $opts[array_rand($opts)];
            $v['v'] = $this->speed($v['seg']); $this->planStop($v);
        }
    }

    /** Compact vehicle rows: [id, segIdx, metres from entry end * 10, dir, state]. The browser has the geometry. */
    public function frame(): array
    {
        $rows = [];
        foreach ($this->veh as $v) $rows[] = [$v['id'], $v['seg'], (int) round($v['s'] * 10), $v['dir'], $v['st']];
        return $rows;
    }

    private function gauss(): float { return sqrt(-2 * log(1 - mt_rand() / (mt_getrandmax() + 1))) * cos(2 * M_PI * mt_rand() / mt_getrandmax()); }

    private function kindIdx(int $id): int { return $id % 10 < 6 ? 0 : ($id % 10 < 9 ? 1 : 2); }

    /**
     * One signed reading per sensor from the vehicles inside its radius (250 m grid lookup), verified at ingest.
     * Rows: [sensorIdx, vibration g, vehicles in range, code, mean speed km/h].
     */
    public function sensorTick(): array
    {
        $cell = 250; $grid = [];
        foreach ($this->veh as $v) {
            [$lon, $lat] = $this->net->pos($v['seg'], $v['s'], $v['dir']);
            $x = ($lon - self::LON0) * 111320 * .9919; $y = ($lat - self::LAT0) * 110574;
            $grid[(int) floor($x / $cell) * 100003 + (int) floor($y / $cell) + 1000][] = [$x, $y, $v];
        }
        $rows = [];
        foreach ($this->sensors as $r) {
            $sid = $r['sid'];
            $x = ($r['lon'] - self::LON0) * 111320 * .9919; $y = ($r['lat'] - self::LAT0) * 110574;
            $cx = (int) floor($x / $cell); $cy = (int) floor($y / $cell);
            $vol = 0; $w = 0.0; $sp = 0.0; $n = 0;
            for ($a = -1; $a <= 1; $a++) for ($b = -1; $b <= 1; $b++) {
                foreach ($grid[($cx + $a) * 100003 + $cy + $b + 1000] ?? [] as [$ox, $oy, $o]) {
                    if (hypot($ox - $x, $oy - $y) > $r['r']) continue;
                    $vol++; $w += self::WT[$this->kindIdx($o['id'])];
                    if ($o['st'] !== 2) { $sp += $o['u']; $n++; }   // parked cars are counted but do not drag the mean speed
                }
            }
            $g = $this->net->seg[$r['seg_idx']];
            $m = ['sid' => $sid, 'seg' => $r['seg'], 'seq' => $this->seq[$sid] = ($this->seq[$sid] ?? 0) + 1,
                'lon' => $r['lon'] + $this->gauss() * 6 / 111320, 'lat' => $r['lat'] + $this->gauss() * 6 / 110574,
                'v' => .12 + $g['iri'] / 15 + .02 * $w + ($this->rnd() - .5) * .08, 'vol' => $vol, 'spd' => $n ? (int) round($sp / $n * 3.6) : 0];
            $m['sig'] = $this->cs->sign($m, $this->keys[$sid]);
            if ($this->forge > 0 && $this->rnd() < $this->forge) {
                if (isset($this->prev[$sid]) && mt_rand(0, 1)) $m = $this->prev[$sid];            // P4: replay
                else { $m['lat'] += .002; $m['v'] = 1.8; }                                         // P1: edited after signing
            } else $this->prev[$sid] = $m;
            $rows[] = [$r['i'], round($m['v'], 3), $m['vol'], $this->cs->verify($m), $m['spd']];
        }
        return $rows;
    }
}
