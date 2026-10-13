import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), VitePWA({
    registerType: 'prompt',
    includeAssets: ['assets/*.svg', 'engines/manifest.json'],
    manifest: {
      name: 'Pion • Your chess journey', short_name: 'Pion',
      description: 'Private, offline chess training with local Stockfish.',
      theme_color: '#132b29', background_color: '#f6f5ef',
      display: 'standalone', start_url: './', scope: './',
      icons: [{src: 'assets/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any'}, {src: 'assets/icon-192.png', sizes: '192x192', type: 'image/png'}, {src: 'assets/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,json,wasm}'],
      globIgnores: ['engines/deep/**'],
      maximumFileSizeToCacheInBytes: 32 * 1024 * 1024,
      cleanupOutdatedCaches: true,
      navigateFallback: 'index.html',
      runtimeCaching: [{urlPattern: /\/engines\/deep\//, handler: 'CacheFirst', options: {cacheName: 'pion-deep-v1'}}],
    },
  })],
  test: {include: ['tests/unit/**/*.test.ts'], environment: 'node'},
  server: {port: 5173, strictPort: true},
  preview: {port: 4173, strictPort: true},
});
