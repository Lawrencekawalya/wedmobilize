<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wedding_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained()->nullOnDelete();
            $table->string('contributor_name');
            $table->string('phone_number', 30)->nullable();
            $table->unsignedBigInteger('amount_pledged')->default(0);
            $table->unsignedBigInteger('amount_paid')->default(0);
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->index(['wedding_id', 'payment_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contributions');
    }
};
