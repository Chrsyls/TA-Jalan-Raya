<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sensors', function (Blueprint $table) {
            $table->id();
            $table->string('sensor_id')->unique();
            $table->string('segment_id');

            // Menggunakan tipe desimal standar (aman di semua database)
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->decimal('alt', 10, 7)->default(0);

            $table->string('status')->default('normal'); // 'normal' atau 'warning'
            $table->string('detection'); // Jenis kerusakan
            $table->float('vibration');
            $table->float('temperature');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sensors');
    }
};
