<?php
namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/** kind 'veh' = vehicle rows, 'sen' = sensor rows. t0 = server time in ms (latency), n = vehicle count, sim = simulation seconds (signal phase), k = speed factor, vms = mean verification time per sensor message (ms). */
class TwinFrame implements ShouldBroadcastNow
{
    public function __construct(public string $kind, public array $data, public int $t0, public int $n = 0, public float $sim = 0.0, public float $k = 1.0, public float $vms = 0.0) {}

    public function broadcastOn(): array { return [new Channel('twin')]; }

    public function broadcastAs(): string { return 'frame'; }
}
