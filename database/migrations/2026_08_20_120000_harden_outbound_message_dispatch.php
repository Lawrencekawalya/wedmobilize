<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('outbound_messages', function (Blueprint $table) {
            $table->uuid('idempotency_key')->nullable()->after('user_id');
            $table->string('request_fingerprint', 64)->nullable()->after('idempotency_key');
            $table->unsignedInteger('unknown_count')->default(0)->after('failed_count');
            $table->unique(['user_id', 'idempotency_key']);
        });
    }

    public function down(): void
    {
        Schema::table('outbound_messages', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'idempotency_key']);
            $table->dropColumn(['idempotency_key', 'request_fingerprint', 'unknown_count']);
        });
    }
};
