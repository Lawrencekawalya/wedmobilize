import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const devServerHost = env.VITE_HMR_HOST || '127.0.0.1';

    return {
        server: {
            host: devServerHost,
            hmr: {
                host: devServerHost,
            },
        },
        plugins: [
            laravel({
                input: ['resources/css/app.css', 'resources/js/app.tsx'],
                refresh: true,
            }),

            inertia(),

            react({
                babel: {
                    plugins: ['babel-plugin-react-compiler'],
                },
            }),

            tailwindcss(),

            wayfinder({
                formVariants: true,
            }),
        ],
    };
});
