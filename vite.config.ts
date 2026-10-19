import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    // يجب أن يطابق اسم المستودع بالضبط
    base: '/Portfolio-and-work/',

    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        // نطلب من البلجن نسخ مجلد الأيقونات بالكامل إلى مجلد البناء
        includeAssets: ['icons/*.png'],
        // إعدادات إضافية لضمان تحديث الكاش وعدم تعليق التطبيق
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
        manifest: {
          name: 'المحفظة المالية الذكية',
          short_name: 'المحفظة',
          description: 'Financial portfolio, work accounts, diary, tools',
          theme_color: '#7c3aed',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/Portfolio-and-work/',
          // قراءة الأيقونات من مجلد icons/
          icons: [
            {
              src: 'icons/icon-72.png',
              sizes: '72x72',
              type: 'image/png',
            },
            {
              src: 'icons/icon-96.png',
              sizes: '96x96',
              type: 'image/png',
            },
            {
              src: 'icons/icon-128.png',
              sizes: '128x128',
              type: 'image/png',
            },
            {
              src: 'icons/icon-144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: 'icons/icon-152.png',
              sizes: '152x152',
              type: 'image/png',
            },
            {
              src: 'icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icons/icon-384.png',
              sizes: '384x384',
              type: 'image/png',
            },
            {
              src: 'icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable', 
            },
          ],
        },
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname || '.', '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
