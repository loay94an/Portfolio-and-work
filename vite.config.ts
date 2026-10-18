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
        registerType: 'autoUpdate', // تحديث التطبيق تلقائياً
        includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // ملفات إضافية
        manifest: {
          name: 'المحفظة المالية الذكية',
          short_name: 'المحفظة',
          description: 'Financial portfolio, work accounts, diary, tools',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone', // ليعمل كتطبيق مستقل
          start_url: '/Portfolio-and-work/', // مهم جداً ليعمل مع المسار الفرعي
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable', // لأيقونات الأندرويد
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
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
