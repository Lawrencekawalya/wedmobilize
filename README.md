# WedMobilize

WedMobilize is a workspace-based wedding planning application for couples and committees. It supports wedding setup, member-aware workspaces, guests, planning meetings, dashboard summaries, and a safe SMS activity foundation.

## Stack

Laravel 13, PHP 8.3, Inertia, React, TypeScript, Vite, Tailwind CSS, shadcn-style components, and Laravel Fortify.

## Local setup

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
npm install
npm run dev
```

Run Laravel separately with `php artisan serve`.

## Quality checks

```bash
composer ci:check
php artisan test
```

## SMS configuration

The default SMS provider logs an outbound request as `pending`; it never claims delivery. Set `SMS_PROVIDER` and `PAHAPPA_SMS_*` only after Pahappa onboarding and a provider implementation are available. Never commit credentials.

## MVP status

Current modules: wedding workspaces, role-aware membership authorization, dashboard, guests, meetings, SMS composition/activity records, and demo data. Contributions, reporting, membership invitations, and live Pahappa delivery are intentionally deferred.
