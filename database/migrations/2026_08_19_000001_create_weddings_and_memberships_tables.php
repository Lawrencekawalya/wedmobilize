<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weddings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('bride_name');
            $table->string('groom_name');
            $table->date('wedding_date');
            $table->string('venue')->nullable();
            $table->unsignedBigInteger('contribution_target')->nullable();
            $table->string('primary_contact_phone', 30)->nullable();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('planning')->index();
            $table->timestamps();
        });

        Schema::create('wedding_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role', 30)->default('committee_member');
            $table->timestamps();
            $table->unique(['wedding_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wedding_memberships');
        Schema::dropIfExists('weddings');
    }
};
