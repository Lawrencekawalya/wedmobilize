<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('phone_number', 30)->nullable()->index();
            $table->string('email')->nullable();
            $table->string('gender', 20)->nullable();
            $table->string('category', 30)->default('other')->index();
            $table->string('invitation_status', 30)->default('not_invited')->index();
            $table->string('attendance_status', 30)->default('unknown')->index();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['wedding_id', 'name']);
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->date('meeting_date')->index();
            $table->time('start_time');
            $table->string('venue')->nullable();
            $table->text('agenda')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('upcoming')->index();
            $table->timestamps();
            $table->index(['wedding_id', 'meeting_date', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meetings');
        Schema::dropIfExists('guests');
    }
};
