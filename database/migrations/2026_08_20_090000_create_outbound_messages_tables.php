<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('outbound_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->string('recipient_mode', 20);
            $table->string('provider')->default('egosms');
            $table->string('sender_id', 20);
            $table->string('status', 30)->default('processing');
            $table->unsignedInteger('recipient_count')->default(0);
            $table->unsignedInteger('submitted_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->unsignedInteger('cost')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });

        Schema::create('outbound_message_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('outbound_message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('contact_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name')->nullable();
            $table->string('phone', 30);
            $table->string('status', 30)->default('pending');
            $table->string('provider_reference')->nullable();
            $table->string('provider_status')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->unique(['outbound_message_id', 'phone']);
            $table->index(['provider_reference', 'phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('outbound_message_recipients');
        Schema::dropIfExists('outbound_messages');
    }
};
