import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {VitePWA} from 'vite-plugin-pwa';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'favicon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
          manifest: {
            name: 'PROT PICK - Pickleball Coaching',
            short_name: 'PROT PICK',
            description: 'Ứng dụng quản lý đào tạo Pickleball bởi HLV Phongprot. Coach students, track skills & manage lessons.',
            theme_color: '#dc2626',
            background_color: '#dc2626',
            display: 'standalone',
            display_override: ['standalone', 'minimal-ui'],
            orientation: 'portrait',
            lang: 'vi',
            start_url: '/?v=1.0.2',
            scope: '/',
            categories: ['sports', 'education', 'productivity'],
            prefer_related_applications: false,
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
            screenshots: [
              {
                src: '/screenshot-mobile-1.png',
                sizes: '414x896',
                type: 'image/png',
                form_factor: 'narrow',
                label: 'Dashboard - Quản lý học viên & buổi tập',
              },
              {
                src: '/screenshot-wide-1.png',
                sizes: '1280x800',
                type: 'image/png',
                form_factor: 'wide',
                label: 'PROT PICK trên Desktop',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
            runtimeCaching: [
              {
                urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'firestore-api',
                  expiration: {maxEntries: 50, maxAgeSeconds: 86400},
                },
              },
            ],
          },
        }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'firebase-vendor': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
