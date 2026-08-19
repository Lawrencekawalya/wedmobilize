<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('outbound_message_recipients')
            ->where('status', 'delivery_failed')
            ->whereRaw('LOWER(provider_status) = ?', ['sent'])
            ->update([
                'status' => 'sent',
                'delivered_at' => null,
                'updated_at' => now(),
            ]);
    }

    public function down(): void
    {
        // This migration corrects misclassified production data and is intentionally irreversible.
    }
};
