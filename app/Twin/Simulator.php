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
    public array $attacks = [];             // queued forgeries from the dashboard: [['P1'..'P6', sensorIdx], ...]
    public float $vms = 0.0;                // mean verification time per message in the last tick (ms)
    private string $attackerKey;
    private array $sensors, $keys, $seq = [], $prev = [], $groups = [], $nodeUse = [];   // groups: laneKey => vehicle indices, sorted leader first
    private const W = ['primary' => .9, 'secondary' => .7, 'tertiary' => .5];
    private const MAIN = ['primary' => true, 'secondary' => true, 'tertiary' => true];
    private const PARK = ['residential' => true, 'unclassified' => true, 'living_street' => true, 'tertiary' => true];
    private const BRAKE = 3, STOP_LINE = 1.5, PARK_P = .035, BUS_P = .30, MINGAP = 2, NODE_CLEAR = 1.2;   // MINGAP: bumper gap (m); NODE_CLEAR: seconds between vehicles of different approaches entering a junction
    private const LEN = [1.85, 4.4, 10.5];              // real lengths (m) of motorbike / car / bus
    private const WT = [0 => .3, 1 => 1.0, 2 => 4.0];   // vibration weight of bike / car / bus
    private const LAT0 = -7.30, LON0 = 112.70;          // sensor grid origin

    public function __construct(public Network $net, public CryptoSpatial $cs, int $vehicles, private float $forge = 0.0)
    {
        $this->sensors = json_decode(file_get_contents(storage_path('app/twin/sensors.json')), true);
        $this->keys = json_decode(file_get_contents(storage_path('app/twin/keys.json')), true);
        foreach ($this->sensors as $r) { $cs->reg[$r['sid']] = $r; $cs->last[$r['sid']] = 0; }
        $this->attackerKey = sodium_crypto_sign_secretkey(sodium_crypto_sign_keypair());   // key of an unregistered attacker (P3)
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

    private function laneKey(int $seg, int $dir): int { return $seg * 2 + ($dir > 0 ? 0 : 1); }

    /** Centre-to-centre distance a follower needs behind a leader: half of each vehicle plus a bumper gap (a bus needs far more room than a bike). */
    private function need(array $lead, array $v): float { return (self::LEN[$this->kindIdx($lead['id'])] + self::LEN[$this->kindIdx($v['id'])]) / 2 + self::MINGAP; }

    private function rearOf(int $key): ?array
    {
        $list = $this->groups[$key] ?? [];
        return $list ? $this->veh[$list[count($list) - 1]] : null;
    }

    /** Decide the next road ahead of time, so followers can look into it and a vehicle can wait for room before entering. */
    private function planNext(array &$v): void
    {
        $g = $this->net->seg[$v['seg']]; $cur = $v['seg'];
        $all = $this->net->out[$v['dir'] > 0 ? $g['to'] : $g['from']] ?? [];
        $opts = array_values(array_filter($all, fn($e) => $e[0] !== $cur));
        if (!$opts) $opts = $all;
        if (!$opts) { $v['nx'] = null; return; }
        if (mt_rand(0, 9) < 6) {   // prefer the faster road class
            $best = max(array_map(fn($e) => $this->net->seg[$e[0]]['sp'], $opts));
            $opts = array_values(array_filter($opts, fn($e) => $this->net->seg[$e[0]]['sp'] == $best));
        }
        $v['nx'] = $opts[array_rand($opts)];
    }

    private function clearAt(int $seg, int $dir, float $s, array $v): bool
    {
        foreach ($this->veh as $o) {
            if ($o['id'] !== $v['id'] && $o['st'] !== 2 && $o['seg'] === $seg && $o['dir'] === $dir && abs($o['s'] - $s) < $this->need($o, $v)) return false;
        }
        return true;
    }

    private function spawn(int $id): array
    {
        $v = null;
        for ($tries = 0; $tries < 15; $tries++) {   // do not appear on top of another vehicle
            do { $i = array_rand($this->net->seg); $w = self::W[$this->net->seg[$i]['hw']] ?? .12; } while ($this->rnd() > $w);
            $g = $this->net->seg[$i];
            $v = ['id' => $id, 'seg' => $i, 'dir' => ($g['ow'] || mt_rand(0, 1)) ? 1 : -1, 's' => $this->rnd() * $g['len'], 'v' => $this->speed($i),
                'u' => 0.0, 'st' => 0, 'hold' => 0.0, 'stopAt' => null, 'stopKind' => 0, 'dur' => 0.0, 'nx' => null];
            if (isset(self::PARK[$g['hw']]) && $this->rnd() < .04) { $v['st'] = 2; $v['hold'] = $this->rnd() * 120; break; }   // a few vehicles start already parked (at the curb)
            if ($this->clearAt($v['seg'], $v['dir'], $v['s'], $v)) break;
        }
        $this->planNext($v);
        if ($v['st'] !== 2) $this->planStop($v);
        return $v;
    }

    /** Advance by $dt simulated seconds. */
    public function step(float $dt): void
    {
        if ($dt <= 0) return;
        $this->t += $dt; $this->cnt = []; $slow = 1 - .35 * $this->rain; $this->groups = []; $leaving = [];
        foreach ($this->veh as $k => &$v) {
            $this->cnt[$v['seg']] = ($this->cnt[$v['seg']] ?? 0) + 1;
            if ($v['st'] === 2 || $v['st'] === 3) {   // parking / boarding timers
                $v['hold'] -= $dt;
                if ($v['hold'] <= 0) { if ($v['st'] === 3) { $v['st'] = 0; $v['hold'] = 0.0; } else $leaving[] = $k; }
            }
            if ($v['st'] !== 2) $this->groups[$this->laneKey($v['seg'], $v['dir'])][] = $k;   // parked cars sit at the curb: not in the lane
            else $v['u'] = 0.0;
        }
        unset($v);
        foreach ($leaving as $k) {   // a parked vehicle pulls out only when the lane is clear around it
            $v = $this->veh[$k]; $key = $this->laneKey($v['seg'], $v['dir']); $blocked = false;
            foreach ($this->groups[$key] ?? [] as $o) { if (abs($this->veh[$o]['s'] - $v['s']) < $this->need($this->veh[$o], $v)) { $blocked = true; break; } }
            if ($blocked) { $this->veh[$k]['hold'] = .8; continue; }
            $this->veh[$k]['st'] = 0; $this->veh[$k]['hold'] = 0.0; $this->groups[$key][] = $k;
        }
        foreach ($this->groups as $key => $list) {   // sort every lane first: look-ahead reads the last (rear) vehicle of the next lane
            usort($list, fn($a, $b) => $this->veh[$b]['s'] <=> $this->veh[$a]['s']);
            $this->groups[$key] = $list;
        }
        foreach ($this->groups as $list) {   // leaders first
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
        if (isset($this->net->signals[$node]) && !$this->net->green($node, $this->net->approachGroup($v['seg'], $v['dir']), $this->t)) {
            $limit = $g['len'] - self::STOP_LINE - self::LEN[$this->kindIdx($v['id'])] / 2; $why = 1;   // red: the FRONT stops at the line
        }
        if ($v['stopAt'] !== null && $v['stopAt'] < $limit) { $limit = $v['stopAt']; $why = 2; }
        $ld = null;
        if ($lead === null && $v['nx'] !== null) {   // nobody ahead on this segment: look at the last vehicle on the next one
            $rear = $this->rearOf($this->laneKey($v['nx'][0], $v['nx'][1]));
            if ($rear !== null && $rear['id'] !== $v['id']) {
                $cap = $g['len'] + $rear['s'] - $this->need($rear, $v);
                if ($cap < $limit) { $limit = $cap; $why = 3; $ld = $rear; }
            }
        }
        if ($lead !== null) {
            $lv = $this->veh[$lead]; $cap = $lv['s'] - $this->need($lv, $v);
            if ($cap < $limit) { $limit = $cap; $why = 3; $ld = $lv; }
        }
        $gap = $limit - $v['s']; $ds = 0.0;
        if ($gap > 0) $ds = $gap < .3 ? $gap : min($v['v'] * $slow * $dt, $gap, sqrt(2 * self::BRAKE * $gap) * $dt);   // braking curve v <= sqrt(2 b gap)
        $v['s'] += $ds; $v['u'] = $ds / $dt;
        if ($why === 2 && $v['s'] >= $v['stopAt'] - .4) { $v['st'] = $v['stopKind']; $v['hold'] = $v['dur']; $v['stopAt'] = null; $v['u'] = 0.0; return; }
        if ($v['u'] > .3) $v['st'] = 0;
        elseif ($why === 1 && $v['s'] >= $limit - .6) $v['st'] = 1;
        elseif ($why === 3 && $ld !== null) $v['st'] = $ld['st'] === 1 ? 1 : (($ld['st'] === 3 || $ld['st'] === 4) ? 4 : 0);
        else $v['st'] = 0;
    }

    /** Move a vehicle that reached the end of its segment onto the next one, or make it wait for room / for the junction to clear. */
    private function advance(int $k): void
    {
        $v = &$this->veh[$k];
        while ($v['s'] >= $this->net->seg[$v['seg']]['len']) {
            $g = $this->net->seg[$v['seg']]; $node = $v['dir'] > 0 ? $g['to'] : $g['from'];
            if ($v['nx'] === null) { $v = $this->spawn($v['id']); return; }
            [$ns, $nd] = $v['nx']; $key = $this->laneKey($ns, $nd); $rear = $this->rearOf($key); $over = $v['s'] - $g['len']; $use = $this->nodeUse[$node] ?? null;
            $noRoom = $rear !== null && $rear['s'] - $over < $this->need($rear, $v);
            $busy = $use !== null && $use['from'] !== $v['seg'] && $this->t - $use['t'] < self::NODE_CLEAR;   // another approach just entered this junction
            if ($noRoom || $busy) {   // wait at the end of the segment, try again next step
                $v['s'] = max(0.0, $g['len'] - self::STOP_LINE - self::LEN[$this->kindIdx($v['id'])] / 2); $v['u'] = 0.0; $v['st'] = 4; return;
            }
            $this->nodeUse[$node] = ['t' => $this->t, 'from' => $v['seg']];
            $v['seg'] = $ns; $v['dir'] = $nd; $v['s'] = $over; $v['v'] = $this->speed($ns); $this->groups[$key][] = $k;
            $this->planNext($v); $this->planStop($v);
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
        $rows = []; $vt = 0; $vn = 0;
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
            $atk = 0;
            foreach ($this->attacks as $ai => [$type, $target]) {   // forgery requested from the dashboard for this sensor
                if ($target === $r['i']) { unset($this->attacks[$ai]); $atk = (int) substr($type, 1); break; }
            }
            if (!$atk && $this->forge > 0 && $this->rnd() < $this->forge) $atk = (isset($this->prev[$sid]) && mt_rand(0, 1)) ? 4 : 1;   // random background forgeries
            if ($atk) $m = $this->forgeMessage($m, $atk, $r);
            else $this->prev[$sid] = $m;
            $t0 = hrtime(true); $code = $this->cs->verify($m); $vt += hrtime(true) - $t0; $vn++;
            $reg = $this->cs->reg[$m['sid']] ?? null;
            $dist = $reg ? (int) round(Network::dist([$m['lon'], $m['lat']], [$reg['lon'], $reg['lat']])) : 0;
            $row = [$r['i'], round($m['v'], 3), $m['vol'], $code, $m['spd'], $dist, $atk];
            if ($code !== 0 || $atk) { $row[] = round($m['lon'], 6); $row[] = round($m['lat'], 6); }   // claimed position, drawn on the map
            $rows[] = $row;
        }
        $this->vms = $vn ? $vt / $vn / 1e6 : 0.0;
        return $rows;
    }

    /** Forgeries P1-P6 (same behaviour as resources/js/cryptospatial.js). P6, a stolen key with a correct position, is meant to pass. */
    private function forgeMessage(array $m, int $atk, array $r): array
    {
        $sid = $r['sid'];
        if ($atk === 1) { $m['lat'] += .002; $m['v'] = 1.8; return $m; }                          // edited after signing
        if ($atk === 4) { if (isset($this->prev[$sid])) return $this->prev[$sid]; $m['lat'] += .002; $m['v'] = 1.8; return $m; }   // replay
        if ($atk === 2) { $d = 15 + $this->rnd() * 105; $a = $this->rnd() * 2 * M_PI; $m['lat'] += $d * sin($a) / 110574; $m['lon'] += $d * cos($a) / 111320; }   // cloned 15-120 m away
        if ($atk === 3) $m['sid'] = 'X-901';
        if ($atk === 5) $m['seg'] = $this->sensors[($r['i'] + 7) % count($this->sensors)]['seg'];
        $m['v'] = 1.8;
        $m['sig'] = $this->cs->sign($m, $atk === 3 ? bin2hex($this->attackerKey) : $this->keys[$sid]);
        return $m;
    }
}
