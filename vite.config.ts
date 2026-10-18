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
        // نطلب من البلجن نسخ الأيقونات إلى مجلد البناء تلقائياً
        includeAssets: ['icon-192.png', 'icon-512.png'],
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
          // تم تغيير الأيقونات لتشير إلى ملفات PNG حقيقية بدلاً من الكود المدمج
          icons: [
            {
              src: 'icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icon-512.png',
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
