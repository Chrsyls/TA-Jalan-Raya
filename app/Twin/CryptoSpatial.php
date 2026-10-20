<?php
namespace App\Twin;

/** Ingest-side Proof of Location: Ed25519 signature + registered coordinates + sequence window. */
class CryptoSpatial
{
    public const OK = 0, UNREGISTERED = 1, BAD_SIGNATURE = 2, REPLAY = 3, OFF_LOCATION = 4, WRONG_SEGMENT = 5;

    public array $reg = [];   // sid => registry row (lon, lat, seg, pub)
    public array $last = [];  // sid => last accepted seq

    public function __construct(public float $threshold = 25.0) {}

    public static function canon(array $m): string
    {
        return implode('|', [$m['sid'], $m['seg'], $m['seq'], sprintf('%.6f', $m['lon']), sprintf('%.6f', $m['lat']), sprintf('%.3f', $m['v']), $m['vol'], $m['spd']]);
    }

    public function sign(array $m, string $secretHex): string
    {
        return sodium_crypto_sign_detached(self::canon($m), hex2bin($secretHex));
    }

    public function verify(array $m): int
    {
        $r = $this->reg[$m['sid']] ?? null;
        if (!$r) return self::UNREGISTERED;
        if (!sodium_crypto_sign_verify_detached($m['sig'], self::canon($m), hex2bin($r['pub']))) return self::BAD_SIGNATURE;
        if ($m['seq'] <= $this->last[$m['sid']]) return self::REPLAY;
        if (Network::dist([$m['lon'], $m['lat']], [$r['lon'], $r['lat']]) > $this->threshold) return self::OFF_LOCATION;
        if ($m['seg'] !== $r['seg']) return self::WRONG_SEGMENT;
        $this->last[$m['sid']] = $m['seq'];
        return self::OK;
    }
}
