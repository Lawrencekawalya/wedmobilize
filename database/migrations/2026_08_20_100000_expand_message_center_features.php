<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('message_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('body');
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('message_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->json('contact_ids');
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::table('outbound_messages', function (Blueprint $table) {
            $table->foreignId('message_template_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->foreignId('message_campaign_id')->nullable()->after('message_template_id')->constrained()->nullOnDelete();
            $table->unsignedSmallInteger('sms_parts')->default(1)->after('recipient_count');
            $table->unsignedInteger('estimated_units')->default(0)->after('sms_parts');
            $table->timestamp('scheduled_at')->nullable()->after('submitted_at');
        });
    }

    public function down(): void
    {
        Schema::table('outbound_messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('message_template_id');
            $table->dropConstrainedForeignId('message_campaign_id');
            $table->dropColumn(['sms_parts', 'estimated_units', 'scheduled_at']);
        });
        Schema::dropIfExists('message_campaigns');
        Schema::dropIfExists('message_templates');
    }
};
