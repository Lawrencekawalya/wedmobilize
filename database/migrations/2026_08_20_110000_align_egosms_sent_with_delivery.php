<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('outbound_message_recipients')
            ->where('status', 'sent')
            ->whereRaw('LOWER(TRIM(provider_status)) = ?', ['sent'])
            ->update([
                'status' => 'delivered',
                'delivered_at' => DB::raw('COALESCE(delivered_at, updated_at, created_at)'),
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // This migration aligns historical provider reports and is intentionally irreversible.
    }
};
