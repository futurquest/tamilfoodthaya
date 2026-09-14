import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/react-router/.test(id)) return 'router';
          if (/tanstack\/query/.test(id)) return 'query';
          if (/i18next/.test(id)) return 'i18n';
          if (/lucide-react/.test(id)) return 'icons';
          if (/react-hook-form/.test(id)) return 'forms';
          if (/react|scheduler/.test(id)) return 'react';
          return 'vendor';
        },
      },
    },
  },
  server: {
    allowedHosts: true,
  },
  preview: {
    allowedHosts: true,
  },
})
