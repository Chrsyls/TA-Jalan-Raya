<?php
namespace App\Twin;

/** Road graph built from public/data/segments.geojson (output of scripts/prepare-its.mjs). */
class Network
{
    public array $seg = [];   // idx => properties + coords + cum
    public array $out = [];   // node => [[segIdx, dir], ...]  (dir +1 = from->to, -1 = to->from)
    public array $signals = [];   // node => ['P' => cycle seconds, 'off' => offset]
    private array $grp = [];
    private const MAJOR = ['primary', 'secondary', 'tertiary'];

    public function __construct(string $file)
    {
        $fc = json_decode(file_get_contents($file), true);
        foreach ($fc['features'] as $i => $f) {
            $c = $f['geometry']['coordinates'];
            $cum = [0.0];
            for ($k = 1; $k < count($c); $k++) $cum[] = $cum[$k - 1] + self::dist($c[$k - 1], $c[$k]);
            $p = $f['properties'];
            $p['len'] = end($cum);
            $this->seg[$i] = $p + ['coords' => $c, 'cum' => $cum];
            $this->out[$p['from']][] = [$i, 1];
            if (!$p['ow']) $this->out[$p['to']][] = [$i, -1];
        }
        // Signalised junctions: 3+ roads meet and at least one is a main road (same rule and formulas as resources/js/net.js)
        foreach ($this->out as $node => $edges) {
            if (count($edges) < 3) continue;
            foreach ($edges as [$i]) {
                if (in_array($this->seg[$i]['hw'], self::MAJOR, true)) { $P = 60 + 15 * ($node % 3); $this->signals[$node] = ['P' => $P, 'off' => ($node * 37) % $P]; break; }
            }
        }
    }

    /** Two-phase signal groups: 0 = traffic arriving mostly east-west, 1 = mostly north-south. */
    public function approachGroup(int $i, int $dir): int
    {
        $k = $i * 2 + ($dir > 0 ? 0 : 1);
        if (!isset($this->grp[$k])) {
            $c = $this->seg[$i]['coords']; $n = count($c);
            $a = $dir > 0 ? $c[$n - 2] : $c[1]; $b = $dir > 0 ? $c[$n - 1] : $c[0];
            $this->grp[$k] = abs(($b[0] - $a[0]) * 0.9917) > abs($b[1] - $a[1]) ? 0 : 1;
        }
        return $this->grp[$k];
    }

    /** Green for group $grp at simulation time $t? Nodes without a signal are always open; 4% all-red between phases. */
    public function green(int $node, int $grp, float $t): bool
    {
        if (!isset($this->signals[$node])) return true;
        $sg = $this->signals[$node];
        $ph = fmod($t + $sg['off'], $sg['P']) / $sg['P'];
        return $ph < .46 ? $grp === 0 : ($ph < .5 ? false : ($ph < .96 ? $grp === 1 : false));
    }

    public static function dist(array $a, array $b): float
    {
        $la = deg2rad(($a[1] + $b[1]) / 2);
        return hypot(($a[0] - $b[0]) * 111320 * cos($la), ($a[1] - $b[1]) * 110574);
    }

    /** Position [lon, lat] $s metres after the entry end of segment $i when travelling in $dir. */
    public function pos(int $i, float $s, int $dir): array
    {
        $g = $this->seg[$i];
        $d = $dir > 0 ? $s : $g['len'] - $s;
        $n = count($g['cum']);
        for ($k = 1; $k < $n; $k++) {
            if ($g['cum'][$k] >= $d || $k === $n - 1) {
                $t = max(0, min(1, ($d - $g['cum'][$k - 1]) / max(1e-9, $g['cum'][$k] - $g['cum'][$k - 1])));
                $a = $g['coords'][$k - 1]; $b = $g['coords'][$k];
                return [$a[0] + ($b[0] - $a[0]) * $t, $a[1] + ($b[1] - $a[1]) * $t];
            }
        }
        return $g['coords'][0];
    }
}
