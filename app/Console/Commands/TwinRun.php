<?php
namespace App\Console\Commands;

use App\Events\TwinFrame;
use App\Twin\{CryptoSpatial, Network, Simulator};
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class TwinRun extends Command
{
    protected $signature = 'twin:run {--vehicles=300} {--hz=4 : vehicle frames per second (sensors tick at 1 Hz)} {--forge=0.02 : share of forged sensor messages} {--threshold=25 : metres}';
    protected $description = 'Traffic + signed sensor simulator: verifies at ingest and broadcasts to Reverb';

    public function handle(): int
    {
        $net = new Network(public_path('data/segments.geojson'));
        $sim = new Simulator($net, new CryptoSpatial((float) $this->option('threshold')), (int) $this->option('vehicles'), (float) $this->option('forge'));
        $hz = max(1, (int) $this->option('hz')); $dt = 1 / $hz; $tick = 0;
        $now = fn() => (int) round(microtime(true) * 1000);
        $this->info(count($net->seg) . " segments, {$this->option('vehicles')} vehicles, {$hz} Hz. Ctrl+C to stop.");
        while (true) {
            $t = microtime(true);
            if ($tick % $hz === 0) {   // scenario controls set by the viewer through /api/control
                $sim->rain = (float) Cache::get('twin.rain', 0);
                $n = (int) Cache::get('twin.n', count($sim->veh));
                if ($n !== count($sim->veh)) $sim->setCount($n);
            }
            $k = (float) Cache::get('twin.speed', 1);   // 0 pauses, 8 is eight times real time
            $sim->step($dt * $k);
            foreach (array_chunk($sim->frame(), 450) as $chunk) event(new TwinFrame('veh', $chunk, $now(), count($sim->veh), $sim->t, $k));   // compact rows: 450 fit well under Reverb's 10 KB limit
            if ($tick % $hz === 0) {
                $rows = $sim->sensorTick();
                event(new TwinFrame('sen', $rows, $now()));
                Cache::put('twin.state', ['t' => $now(), 'rows' => $rows], 30);   // for the polling baseline (V0)
            }
            $tick++;
            $left = $dt - (microtime(true) - $t);
            if ($left > 0) usleep((int) ($left * 1e6));
        }
    }
}
