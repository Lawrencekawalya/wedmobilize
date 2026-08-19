<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_phone', 30);
            $table->string('recipient_name')->nullable();
            $table->text('message');
            $table->string('message_type', 40)->default('announcement');
            $table->string('status', 20)->default('pending')->index();
            $table->string('provider')->nullable();
            $table->string('provider_message_id')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->index(['wedding_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_messages');
    }
};
