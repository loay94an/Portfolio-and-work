import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// كود أيقونة SVG مدمج (محفظة مالية بلون بنفسجي يناسب التطبيق)
const defaultIcon = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><rect width='512' height='512' rx='100' fill='%237c3aed'/><path d='M128 160h256c17.7 0 32 14.3 32 32v160c0 17.7-14.3 32-32 32H128c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32z' fill='none' stroke='%23fff' stroke-width='24'/><path d='M352 256h48v64h-48c-17.7 0-32-14.3-32-32s14.3-32 32-32z' fill='%23fff'/></svg>";

export default defineConfig(() => {
  return {
    // يجب أن يطابق اسم المستودع بالضبط
    base: '/Portfolio-and-work/',

    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'المحفظة المالية الذكية',
          short_name: 'المحفظة',
          description: 'Financial portfolio, work accounts, diary, tools',
          theme_color: '#7c3aed', // تم تغييره للبنفسجي ليتطابق مع الأيقونة والموقع
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/Portfolio-and-work/',
          icons: [
            {
              src: defaultIcon,
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: defaultIcon,
              sizes: '512x512',
              type: 'image/svg+xml',
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
